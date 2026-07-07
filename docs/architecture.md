# Architecture

## Pattern

Feature-based architecture.

Presentation

↓

Hooks

↓

Services

↓

API

↓

Database

## Layers

Components

Hooks

Services

Utils

Types

Schemas

## Dependency Rules

Components never call fetch directly.

Hooks never access database.

Services contain API logic.

Utils remain pure.

## Data Flow

User

↓

Component

↓

Hook

↓

Service

↓

API

↓

Database
