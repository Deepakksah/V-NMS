package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func ConnectDB(connStr string) error {
	// 1. Ensure target database exists (creates vnms if not present)
	if err := EnsureDatabaseCreated(connStr); err != nil {
		log.Printf("[DB Notice] EnsureDatabaseCreated: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	config, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		return fmt.Errorf("error parsing db config: %w", err)
	}

	config.MaxConns = 25
	config.MinConns = 5
	config.MaxConnIdleTime = 15 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}

	Pool = pool
	log.Println("Connected to PostgreSQL successfully")

	// 2. Automatically run all table migrations
	if err := RunAutoMigrations(); err != nil {
		log.Printf("[DB Warning] RunAutoMigrations: %v", err)
	}

	// 3. Seed default accounts
	if err := SeedDefaultUsers(); err != nil {
		log.Printf("[DB Notice] SeedDefaultUsers: %v", err)
	}

	return nil
}