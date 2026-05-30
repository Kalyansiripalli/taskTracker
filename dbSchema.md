# Phase 1: Database Generation Specification (No Seeding)

This specification governs the structural implementation of the PostgreSQL data layer using Prisma. Seeding operations are explicitly deferred to a later phase.

---

## 1. The Core Schema Configuration (`prisma/schema.prisma`)

The database architecture leverages PostgreSQL native features, explicitly establishing Enums, strict Foreign Key cascading rules, and highly optimized composite performance indexes.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Enums Definitions
enum UserRole {
  ADMIN
  MANAGER
  MEMBER
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
  BLOCKED
}

// 1. Organizations (The Core Tenant Boundary)
model Organization {
  id         String   @id @default(uuid()) @db.Uuid
  name       String   @db.VarChar(255)
  created_at DateTime @default(now()) @db.Timestamptz

  users      User[]
  tasks      Task[]

  @@map("organizations")
}

// 2. Users Table
model User {
  id              String   @id @default(uuid()) @db.Uuid
  organization_id String   @db.Uuid
  email           String   @unique @db.VarChar(255)
  password_hash   String   @db.VarChar(255)
  role            UserRole @default(MEMBER)
  created_at      DateTime @default(now()) @db.Timestamptz

  organization    Organization    @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  created_tasks   Task[]          @relation("CreatedTasks")
  assigned_tasks  Task[]          @relation("AssignedTasks")
  refresh_tokens  RefreshToken[]

  @@index([email], name: "idx_users_email")
  @@map("users")
}

// 3. Tasks Table
model Task {
  id              String       @id @default(uuid()) @db.Uuid
  organization_id String       @db.Uuid
  title           String       @db.VarChar(255)
  description     String?      @db.Text
  priority        TaskPriority @default(MEDIUM)
  status          TaskStatus   @default(TODO)
  creator_id      String       @db.Uuid
  assignee_id     String?      @db.Uuid
  due_date        DateTime     @db.Timestamptz
  created_at      DateTime     @default(now()) @db.Timestamptz
  updated_at      DateTime     @updatedAt @db.Timestamptz

  organization    Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  creator         User         @relation("CreatedTasks", fields: [creator_id], references: [id], onDelete: Restrict)
  assignee        User?        @relation("AssignedTasks", fields: [assignee_id], references: [id], onDelete: SetNull)

  // Composite Indexes for Query Optimization
  @@index([organization_id, assignee_id, status], name: "idx_tasks_org_assignee_status")
  @@index([organization_id, due_date], name: "idx_tasks_org_due_date")
  @@map("tasks")
}

// 4. Refresh Tokens Table (Token Rotation Store)
model RefreshToken {
  id         String   @id @default(uuid()) @db.Uuid
  user_id    String   @db.Uuid
  token      String   @unique @db.VarChar(512)
  is_revoked Boolean  @default(false)
  expires_at DateTime @db.Timestamptz
  created_at DateTime @default(now()) @db.Timestamptz

  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}
```
