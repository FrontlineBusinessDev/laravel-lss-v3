# Learning Solutions System — Definitive Stack Setup Guide

### Laravel 13 · React 19 (TypeScript Strict) · Inertia.js · PHP 8.4

### Tailwind CSS v4.3 · Breeze Auth · Spatie RBAC · SQLite (dev) · PostgreSQL (prod)

---

> **What this guide is:** A clean, production-ready bootstrap for your Learning Solutions System.
> No features are built. No modules are implemented. This is your foundation — the boilerplate
> every senior developer sets up before writing a single line of business logic.
>
> Comments throughout the guide tell you **exactly where** to add each module (Dashboard,
> Batches, Trainees, Courses, etc.) and each role (Admin, Trainer, Trainee) when you are ready.

---

## Table of Contents

1. [Prerequisites & System Requirements](#1-prerequisites--system-requirements)
2. [Install PHP 8.4](#2-install-php-84)
3. [Install Composer & Laravel Installer](#3-install-composer--laravel-installer)
4. [Install Node.js via nvm](#4-install-nodejs-via-nvm)
5. [Create the Project via Laravel Interactive CLI](#5-create-the-project-via-laravel-interactive-cli)
6. [Post-Install Environment Configuration](#6-post-install-environment-configuration)
7. [Install Spatie Permission](#7-install-spatie-permission)
8. [Upgrade to Tailwind CSS v4.3](#8-upgrade-to-tailwind-css-v43)
9. [Restructure to TypeScript-First](#9-restructure-to-typescript-first)
10. [TypeScript Configuration](#10-typescript-configuration)
11. [Vite Configuration](#11-vite-configuration)
12. [Configure bootstrap/app.php](#12-configure-bootstrapappphp)
13. [Update the User Model](#13-update-the-user-model)
14. [Update HandleInertiaRequests Middleware](#14-update-handleinertiarequests-middleware)
15. [Global Stylesheet — Design Tokens](#15-global-stylesheet--design-tokens)
16. [TypeScript Type Definitions](#16-typescript-type-definitions)
17. [Utility Functions & Hooks](#17-utility-functions--hooks)
18. [App Entry Point](#18-app-entry-point)
19. [Blade Root Layout](#19-blade-root-layout)
20. [Route Organization](#20-route-organization)
21. [SQLite for Development](#21-sqlite-for-development)
22. [PostgreSQL for Production](#22-postgresql-for-production)
23. [Roles, Permissions & Seeders](#23-roles-permissions--seeders)
24. [Run Migrations & Seeders](#24-run-migrations--seeders)
25. [Complete Folder Structure](#25-complete-folder-structure)
26. [Run the Development Server](#26-run-the-development-server)
27. [Verify the Installation](#27-verify-the-installation)
28. [Git Setup](#28-git-setup)
29. [VS Code & Prettier Setup](#29-vs-code--prettier-setup)
30. [Where to Build Your Modules](#30-where-to-build-your-modules)
31. [Production Deployment Checklist](#31-production-deployment-checklist)
32. [Daily Command Reference](#32-daily-command-reference)

---

## 1. Prerequisites & System Requirements

| Tool       | Minimum          | Check               |
| ---------- | ---------------- | ------------------- |
| PHP        | 8.4+             | `php -v`            |
| Composer   | 2.x              | `composer -V`       |
| Node.js    | 20 LTS or 22 LTS | `node -v`           |
| npm        | 10+              | `npm -v`            |
| Git        | Any recent       | `git --version`     |
| SQLite     | 3.x              | `sqlite3 --version` |
| PostgreSQL | 15+ (prod only)  | `psql --version`    |

**Supported OS:** Ubuntu 22.04/24.04 · macOS 13+ · WSL2 (Windows 11) · Windows (PowerShell)

---

## 2. Install PHP 8.4

### Ubuntu / Debian / WSL2

```bash
sudo apt update && sudo apt upgrade -y

# The Ondřej Surý PPA is REQUIRED for PHP 8.4 on Ubuntu.
# Ubuntu's default repos only carry PHP 8.3.
# Always add this PPA BEFORE running apt install.
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP 8.4 with all extensions Laravel needs
sudo apt install -y \
  php8.4 \
  php8.4-cli \
  php8.4-fpm \
  php8.4-mbstring \
  php8.4-xml \
  php8.4-bcmath \
  php8.4-curl \
  php8.4-zip \
  php8.4-sqlite3 \
  php8.4-pgsql \
  php8.4-intl \
  php8.4-tokenizer \
  php8.4-dom \
  php8.4-fileinfo \
  unzip curl git
```

### macOS (Homebrew)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew tap shivammathur/php
brew install shivammathur/php/php@8.4
brew link --overwrite --force php@8.4
```

### Windows (PowerShell — Run as Administrator)

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = `
  [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.4'))
```

Close and reopen PowerShell after it completes.

### Verify

```bash
php -v
# Expected: PHP 8.4.x (cli)

# Confirm all required extensions loaded
php -m | grep -E "mbstring|xml|bcmath|curl|zip|sqlite3|pgsql|intl"
# All six should appear
```

---

## 3. Install Composer & Laravel Installer

```bash
# Download and install Composer globally
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"

# Verify
composer -V
# Composer version 2.x.x

# Install the Laravel CLI globally
composer global require laravel/installer

# Add Composer's global bin to your PATH — add this to ~/.bashrc or ~/.zshrc
export PATH="$HOME/.composer/vendor/bin:$PATH"
source ~/.bashrc
```

> **Windows PATH:** Add `%USERPROFILE%\AppData\Roaming\Composer\vendor\bin` to your
> System Environment Variables → Path, then restart PowerShell.

---

## 4. Install Node.js via nvm

Using **nvm** (Node Version Manager) is the professional standard. It lets you switch Node
versions per project and avoids permission issues with global npm installs.

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
source ~/.bashrc    # or ~/.zshrc on macOS/zsh

# Install Node.js 22 LTS (recommended)
nvm install 22
nvm use 22
nvm alias default 22

# Verify
node -v    # v22.x.x
npm -v     # 10.x.x
```

---

## 5. Create the Project via Laravel Interactive CLI

Navigate to your projects folder and run the Laravel new command. The interactive CLI
scaffolds the entire project — including Breeze auth with React + TypeScript — in one step.

```bash
cd ~/projects    # Windows: cd C:\xampp\htdocs or wherever you keep projects

laravel new learning-solutions-system
```

**Answer each prompt exactly as shown:**

| Prompt                         | Your Answer                             |
| ------------------------------ | --------------------------------------- |
| Which starter kit?             | `React with Inertia`                    |
| Which authentication provider? | `Laravel (Breeze)`                      |
| Would you like TypeScript?     | `Yes`                                   |
| Add teams support?             | `No`                                    |
| Which testing framework?       | `Pest` _(recommended — cleaner syntax)_ |
| Install Laravel Boost?         | `No`                                    |
| Which database?                | `SQLite`                                |
| Run default migrations?        | `Yes`                                   |
| Remove existing VCS?           | `Yes`                                   |
| Run npm install?               | `Yes`                                   |

```bash
# Enter the project — ALL remaining commands run from here
cd learning-solutions-system
```

**What Breeze gives you out of the box:**

- Login, Register, Email Verification, Password Reset, Password Confirmation
- All wired to Inertia + React + TypeScript
- Auth pages scaffolded in `resources/js/Pages/Auth/`
- Auth routes in `routes/auth.php`

**Verify the project:**

```bash
php artisan --version
# Laravel Framework 13.x.x

composer run dev
# Opens http://localhost:8000 — you should see the landing page with Log in / Register
# Press Ctrl+C to stop before continuing
```

> **If your project folder is over 700 MB:** You likely have a node_modules issue.
> Delete the folder and recreate: `rm -rf learning-solutions-system` then `laravel new learning-solutions-system`

---

## 6. Post-Install Environment Configuration

### Fix APP_NAME

Open `.env` and ensure `APP_NAME` is quoted — values with spaces MUST be quoted:

```dotenv
APP_NAME="Learning Solutions System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
```

### Generate app key

```bash
php artisan key:generate
# If you see "The environment file is invalid!" — check that APP_NAME has quotes
```

### Verify SQLite

```bash
grep DB_CONNECTION .env
# DB_CONNECTION=sqlite

ls database/database.sqlite
# File should exist — the installer created it
```

---

## 7. Install Spatie Permission

```bash
# Install the package
composer require spatie/laravel-permission

# Publish config file and migration
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

Confirm these two files were created:

- `config/permission.php`
- A migration in `database/migrations/` ending in `_create_permission_tables.php`

---

## 8. Upgrade to Tailwind CSS v4.3

Breeze installs Tailwind v3 by default. We upgrade to v4 which uses a CSS-first approach
(no `tailwind.config.js` needed).

```bash
# Remove Tailwind v3 and its config ecosystem
npm uninstall tailwindcss @tailwindcss/forms postcss autoprefixer

# Remove old config files
rm -f tailwind.config.js tailwind.config.ts postcss.config.js postcss.config.cjs

# Install Tailwind v4 and its official Vite plugin
npm install tailwindcss @tailwindcss/vite
```

---

## 9. Restructure to TypeScript-First

Breeze scaffolds files into `resources/js/`. We move everything to `resources/ts/` to make the
TypeScript-first intent explicit and avoid confusion between `.js` and `.ts` files.

```bash
# Move the entire js folder to ts
mv resources/js resources/ts

# Rename entry points if Breeze created them as .jsx
mv resources/ts/app.jsx resources/ts/app.tsx 2>/dev/null || true
mv resources/ts/ssr.jsx resources/ts/ssr.tsx 2>/dev/null || true

# Create directories Breeze does NOT scaffold
mkdir -p resources/ts/features
mkdir -p resources/ts/store
mkdir -p resources/ts/utils
mkdir -p resources/ts/services
mkdir -p resources/ts/constants
mkdir -p resources/ts/hooks
mkdir -p resources/ts/components/ui
mkdir -p resources/ts/components/forms
mkdir -p resources/ts/components/shared

# Create PHP backend scalability directories
mkdir -p app/Actions
mkdir -p app/Services
mkdir -p app/Repositories
mkdir -p app/Enums
mkdir -p app/Events
mkdir -p app/Listeners
mkdir -p app/Jobs
mkdir -p app/Policies
mkdir -p app/Notifications
```

---

## 10. TypeScript Configuration

Replace the entire contents of `tsconfig.json`:

```json
{
    "compilerOptions": {
        "ignoreDeprecations": "5.0",
        "target": "ES2022",
        "lib": ["ES2022", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "jsx": "react-jsx",
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "noImplicitReturns": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "exactOptionalPropertyTypes": true,
        "allowImportingTsExtensions": true,
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "skipLibCheck": true,
        "noEmit": true,
        "types": ["vite/client"],
        "baseUrl": ".",
        "paths": {
            "@/*": ["resources/ts/*"],
            "@components/*": ["resources/ts/components/*"],
            "@pages/*": ["resources/ts/pages/*"],
            "@layouts/*": ["resources/ts/layouts/*"],
            "@hooks/*": ["resources/ts/hooks/*"],
            "@types/*": ["resources/ts/types/*"],
            "@utils/*": ["resources/ts/utils/*"],
            "@features/*": ["resources/ts/features/*"],
            "@services/*": ["resources/ts/services/*"],
            "@store/*": ["resources/ts/store/*"]
        }
    },
    "include": ["resources/ts/**/*", "vite.config.ts"],
    "exclude": ["node_modules", "public", "vendor"]
}
```

> **Why `ignoreDeprecations: "5.0"`:** TypeScript 5 deprecates `baseUrl` but still requires it
> when `paths` is used. This flag silences that misleading warning. Your config is valid.

> **Why `types: ["vite/client"]`:** Lets TypeScript understand `import '*.css'`,
> `import.meta.glob`, and `import.meta.env` — all used by Inertia + Vite.

---

## 11. Vite Configuration

Install the missing Node type definitions first:

```bash
npm install --save-dev @types/node
```

Rename and replace your Vite config:

```bash
mv vite.config.js vite.config.ts 2>/dev/null || true
```

Replace the entire contents of `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            // Entry points — CSS first, then the TypeScript entry
            input: ['resources/css/app.css', 'resources/ts/app.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/ts'),
            '@components': path.resolve(__dirname, './resources/ts/components'),
            '@pages': path.resolve(__dirname, './resources/ts/pages'),
            '@layouts': path.resolve(__dirname, './resources/ts/layouts'),
            '@hooks': path.resolve(__dirname, './resources/ts/hooks'),
            '@types': path.resolve(__dirname, './resources/ts/types'),
            '@utils': path.resolve(__dirname, './resources/ts/utils'),
            '@features': path.resolve(__dirname, './resources/ts/features'),
            '@services': path.resolve(__dirname, './resources/ts/services'),
            '@store': path.resolve(__dirname, './resources/ts/store'),
        },
    },
    build: {
        sourcemap: false,
        rollupOptions: {
            output: {
                // Code-split vendor chunks for faster page loads
                manualChunks(id) {
                    if (
                        id.includes('node_modules/react') ||
                        id.includes('node_modules/react-dom')
                    ) {
                        return 'vendor';
                    }
                    if (id.includes('node_modules/@inertiajs')) {
                        return 'inertia';
                    }
                },
            },
        },
    },
});
```

---

## 12. Configure bootstrap/app.php

Replace the entire contents of `bootstrap/app.php`:

```php
<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // Inertia — shares server-side data with every React page
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        // Spatie Permission middleware aliases
        // Usage on routes:
        //   Route::middleware('role:admin')
        //   Route::middleware('permission:manage trainees')
        //   Route::middleware('role_or_permission:trainer|manage batches')
        $middleware->alias([
            'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
```

---

## 13. Update the User Model

Replace the contents of `app/Models/User.php`:

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TODO: Add LSS domain relationships here as you build each module.
    //
    // Example relationships to add:
    //
    // /** Trainees enrolled in batches (via Enrollment model) */
    // public function enrollments(): HasMany
    // {
    //     return $this->hasMany(Enrollment::class);
    // }
    //
    // /** Batches this user is training as an instructor */
    // public function trainedBatches(): HasMany
    // {
    //     return $this->hasMany(Batch::class, 'trainer_id');
    // }
    //
    // /** Extended profile (avatar, bio, contact info) */
    // public function profile(): HasOne
    // {
    //     return $this->hasOne(UserProfile::class);
    // }
    // ─────────────────────────────────────────────────────────────────────────
}
```

---

## 14. Update HandleInertiaRequests Middleware

Open `app/Http/Middleware/HandleInertiaRequests.php` and replace its contents:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root Blade template loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version for cache busting.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Shared props — sent to EVERY React page automatically.
     * Access in any page via: const { auth, flash } = usePage().props
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [

            // Authenticated user — null when logged out
            'auth' => [
                'user' => $request->user() ? [
                    'id'                => $request->user()->id,
                    'name'              => $request->user()->name,
                    'email'             => $request->user()->email,
                    'email_verified_at' => $request->user()->email_verified_at,
                    'roles'             => $request->user()->getRoleNames(),
                    'permissions'       => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],

            // Flash messages — available after any redirect
            // Usage in Laravel: return redirect()->back()->with('success', 'Batch created.');
            // Usage in React: const { flash } = usePage().props;
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info'    => fn () => $request->session()->get('info'),
            ],
        ]);
    }
}
```

---

## 15. Global Stylesheet — Design Tokens

Replace the entire contents of `resources/css/app.css`:

```css
/* ═══════════════════════════════════════════════════════════════════════════
   Learning Solutions System — Global Stylesheet
   Tailwind CSS v4.3 — CSS-first (no tailwind.config.js needed)
═══════════════════════════════════════════════════════════════════════════ */
@import 'tailwindcss';

/* ───────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
   These CSS custom properties are your design system.
   Use them everywhere: Tailwind classes, plain CSS, inline styles.
   Example: className="bg-[var(--color-primary)]"
─────────────────────────────────────────────────────────────────────────── */
@layer base {
    :root {
        /* ── Brand Colors ─────────────────────────────────────────────────── */
        --color-primary: #2563eb; /* Blue 600  — primary actions  */
        --color-primary-hover: #1d4ed8; /* Blue 700  — hover state      */
        --color-primary-light: #dbeafe; /* Blue 100  — subtle highlight */
        --color-secondary: #7c3aed; /* Violet 600 — accents         */
        --color-accent: #0ea5e9; /* Sky 500   — links, icons     */

        /* ── Neutral Palette ──────────────────────────────────────────────── */
        --color-background: #f8fafc; /* Slate 50  — page background  */
        --color-surface: #ffffff; /* White     — cards, panels    */
        --color-surface-raised: #f1f5f9; /* Slate 100 — nested surfaces  */
        --color-border: #e2e8f0; /* Slate 200 — default borders  */
        --color-border-strong: #cbd5e1; /* Slate 300 — emphasis borders */
        --color-text: #0f172a; /* Slate 900 — primary text     */
        --color-text-muted: #64748b; /* Slate 500 — secondary text   */
        --color-text-subtle: #94a3b8; /* Slate 400 — placeholder text */

        /* ── Feedback / Status ────────────────────────────────────────────── */
        --color-success: #16a34a; /* Green 600 */
        --color-success-light: #dcfce7; /* Green 100 */
        --color-warning: #d97706; /* Amber 600 */
        --color-warning-light: #fef3c7; /* Amber 100 */
        --color-error: #dc2626; /* Red 600   */
        --color-error-light: #fee2e2; /* Red 100   */
        --color-info: #0284c7; /* Sky 600   */
        --color-info-light: #e0f2fe; /* Sky 100   */

        /* ── LSS Role Badge Colors ────────────────────────────────────────── */
        /* TODO: Adjust these to match your brand when you add role badges */
        --color-role-admin: #7c3aed; /* Violet — Admin               */
        --color-role-trainer: #0891b2; /* Cyan   — Trainer/Instructor  */
        --color-role-trainee: #16a34a; /* Green  — Trainee/Learner     */

        /* ── Batch/Status Colors (for future batch management module) ──────── */
        /* TODO: Uncomment and adjust when you build the Batches module */
        /* --color-batch-active:    #16a34a; */
        /* --color-batch-upcoming:  #d97706; */
        /* --color-batch-completed: #64748b; */
        /* --color-batch-cancelled: #dc2626; */

        /* ── Typography ───────────────────────────────────────────────────── */
        --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
        --font-mono: 'JetBrains Mono', ui-monospace, monospace;

        /* ── Spacing & Shape ──────────────────────────────────────────────── */
        --radius-sm: 0.25rem;
        --radius-md: 0.5rem;
        --radius-lg: 0.75rem;
        --radius-xl: 1rem;
        --radius-2xl: 1.5rem;

        /* ── Layout ───────────────────────────────────────────────────────── */
        /* TODO: Adjust sidebar width when you build AppLayout */
        --sidebar-width: 260px;
        --sidebar-collapsed-width: 72px;
        --topbar-height: 64px;
    }
}

/* ───────────────────────────────────────────────────────────────────────────
   GLOBAL BASE STYLES
─────────────────────────────────────────────────────────────────────────── */
@layer base {
    html {
        font-family: var(--font-sans);
        background-color: var(--color-background);
        color: var(--color-text);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    body {
        min-height: 100vh;
    }

    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    /* Accessible focus ring — do not remove */
    :focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
        border-radius: var(--radius-sm);
    }
}

/* ───────────────────────────────────────────────────────────────────────────
   COMPONENT LAYER
   Add shared component classes here as your system grows.
   These obey Tailwind's specificity cascade.

   TODO: Add these as you build:
   .btn-primary     { ... }
   .btn-secondary   { ... }
   .card            { ... }
   .badge           { ... }
   .sidebar-link    { ... }
   .page-header     { ... }
   .data-table      { ... }
─────────────────────────────────────────────────────────────────────────── */
@layer components {
}
```

---

## 16. TypeScript Type Definitions

### resources/ts/types/inertia.d.ts

```typescript
// ─── types/inertia.d.ts ───────────────────────────────────────────────────────
// Extends Inertia's PageProps with the shared props from HandleInertiaRequests.
// These are automatically available in every page via usePage().props

import type { PageProps as InertiaPageProps } from '@inertiajs/react';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles: string[]; // e.g. ['admin'] or ['trainer'] or ['trainee']
    permissions: string[]; // e.g. ['manage trainees', 'view reports']
}

declare module '@inertiajs/react' {
    interface PageProps extends InertiaPageProps {
        auth: {
            user: AuthUser | null;
        };
        flash: {
            success?: string;
            error?: string;
            warning?: string;
            info?: string;
        };
    }
}
```

### resources/ts/types/models.d.ts

```typescript
// ─── types/models.d.ts ────────────────────────────────────────────────────────
// TypeScript interfaces mirroring your Eloquent models.
// Add a new interface here every time you create a new model.
// Keep these in sync with your database migrations.

// ─── Core ────────────────────────────────────────────────────────────────────

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles: string[];
    permissions: string[];
    created_at: string;
    updated_at: string;
}

// ─── Pagination wrapper (Laravel paginator shape) ─────────────────────────────
export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Add your LSS domain models below as you build each module.
// Reference this file in all your page components for type safety.
// ─────────────────────────────────────────────────────────────────────────────
//
// export type BatchStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
// export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped';
// export type CourseStatus = 'draft' | 'published' | 'archived';
// export type AssessmentType = 'quiz' | 'assignment' | 'exam';
//
// export interface Course {
//     id: number;
//     title: string;
//     slug: string;
//     description: string;
//     thumbnail_url?: string;
//     status: CourseStatus;
//     created_by: number;
//     creator?: User;
//     batches?: Batch[];
//     created_at: string;
//     updated_at: string;
// }
//
// export interface Batch {
//     id: number;
//     course_id: number;
//     course?: Course;
//     trainer_id: number;
//     trainer?: User;
//     name: string;
//     start_date: string;
//     end_date: string;
//     max_trainees: number;
//     status: BatchStatus;
//     enrollments?: Enrollment[];
//     enrollments_count?: number;
//     created_at: string;
//     updated_at: string;
// }
//
// export interface Enrollment {
//     id: number;
//     batch_id: number;
//     batch?: Batch;
//     user_id: number;
//     trainee?: User;
//     status: EnrollmentStatus;
//     progress_percentage: number;
//     enrolled_at: string;
//     completed_at?: string;
// }
//
// export interface Module {
//     id: number;
//     course_id: number;
//     course?: Course;
//     title: string;
//     description?: string;
//     order: number;
//     lessons?: Lesson[];
// }
//
// export interface Lesson {
//     id: number;
//     module_id: number;
//     title: string;
//     content?: string;
//     video_url?: string;
//     duration_minutes?: number;
//     order: number;
// }
//
// export interface Assessment {
//     id: number;
//     lesson_id?: number;
//     module_id?: number;
//     title: string;
//     type: AssessmentType;
//     passing_score: number;
//     questions?: AssessmentQuestion[];
// }
//
// export interface AssessmentQuestion {
//     id: number;
//     assessment_id: number;
//     question: string;
//     options: string[];
//     correct_answer: number;
//     points: number;
// }
//
// export interface Certificate {
//     id: number;
//     enrollment_id: number;
//     enrollment?: Enrollment;
//     issued_at: string;
//     certificate_url: string;
// }
//
// export interface Report {
//     trainee: User;
//     batch: Batch;
//     progress_percentage: number;
//     completed_lessons: number;
//     total_lessons: number;
//     assessment_scores: number[];
//     average_score: number;
// }
```

### resources/ts/types/index.d.ts

```typescript
// ─── types/index.d.ts ─────────────────────────────────────────────────────────
// Barrel export — import any type with: import type { Batch, Course } from '@types';

export * from './models.d';
// Note: inertia.d.ts uses module augmentation — no export needed
```

---

## 17. Utility Functions & Hooks

### resources/ts/utils/helpers.ts

```typescript
// ─── utils/helpers.ts ─────────────────────────────────────────────────────────

/**
 * Conditionally join CSS class names.
 * Usage: cn('base', isActive && 'active', hasError && 'text-red-500')
 */
export function cn(
    ...classes: (string | boolean | undefined | null)[]
): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Format an ISO date string to a readable format.
 * Usage: formatDate('2025-06-01') → 'June 1, 2025'
 */
export function formatDate(date: string | null | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format a date with time.
 * Usage: formatDateTime('2025-06-01T09:00:00Z') → 'June 1, 2025, 9:00 AM'
 */
export function formatDateTime(date: string | null | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
    return str.length <= maxLength ? str : `${str.slice(0, maxLength)}...`;
}

/**
 * Get initials from a full name.
 * Usage: getInitials('Juan Dela Cruz') → 'JD'
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() ?? '')
        .join('');
}
```

### resources/ts/hooks/usePermissions.ts

```typescript
// ─── hooks/usePermissions.ts ──────────────────────────────────────────────────
// Frontend mirror of Spatie's hasRole() and can() methods.
// Use this in any React component to gate UI based on roles/permissions.
//
// Usage:
//   const { isAdmin, isTrainer, can } = usePermissions();
//
//   {isAdmin() && <AdminOnlyButton />}
//   {can('manage batches') && <CreateBatchButton />}

import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage().props;
    const user = auth.user;

    const hasRole = (role: string): boolean =>
        user?.roles?.includes(role) ?? false;

    const hasAnyRole = (...roles: string[]): boolean => roles.some(hasRole);

    const can = (permission: string): boolean =>
        user?.permissions?.includes(permission) ?? false;

    const canAny = (...permissions: string[]): boolean => permissions.some(can);

    // ── LSS-specific role helpers ──────────────────────────────────────────
    // TODO: Add or rename roles to match what you define in PermissionSeeder
    const isAdmin = (): boolean => hasRole('admin');
    const isTrainer = (): boolean => hasRole('trainer');
    const isTrainee = (): boolean => hasRole('trainee');

    const isAuthenticated = (): boolean => user !== null;

    return {
        user,
        hasRole,
        hasAnyRole,
        can,
        canAny,
        isAdmin,
        isTrainer,
        isTrainee,
        isAuthenticated,
    };
}
```

### resources/ts/hooks/useFlash.ts

```typescript
// ─── hooks/useFlash.ts ────────────────────────────────────────────────────────
// Access Laravel flash messages in any React component.
//
// Usage:
//   const flash = useFlash();
//   {flash.success && <SuccessAlert message={flash.success} />}

import { usePage } from '@inertiajs/react';

export function useFlash() {
    const { flash } = usePage().props;
    return flash;
}
```

---

## 18. App Entry Point

Replace the contents of `resources/ts/app.tsx`:

```tsx
// ─── app.tsx ──────────────────────────────────────────────────────────────────
// Inertia.js React entry point.
// This file boots the React app and connects it to Inertia.
// Do not add business logic here.

import '../css/app.css';
import './bootstrap';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import type { ResolvedComponent } from '@inertiajs/react';

// Lazy-load each page component — enables per-page code splitting.
// Each page in resources/ts/pages/ becomes its own JS chunk.
const pages = import.meta.glob<ResolvedComponent>('./pages/**/*.tsx');

createInertiaApp({
    // Browser tab title format: "Dashboard | Learning Solutions System"
    title: (title) => `${title} | Learning Solutions System`,

    resolve: async (name) => {
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(
                `[Inertia] Page not found: ./pages/${name}.tsx\n` +
                    `Ensure the file exists in resources/ts/pages/`,
            );
        }

        return page();
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },

    progress: {
        color: '#2563eb', // Matches --color-primary
        showSpinner: false,
    },
});
```

### resources/ts/bootstrap.ts

```typescript
// ─── bootstrap.ts ─────────────────────────────────────────────────────────────
// Global axios configuration. Inertia uses axios for all HTTP requests.

import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

declare global {
    interface Window {
        axios: typeof axios;
    }
}
```

---

## 19. Blade Root Layout

Confirm or replace `resources/views/app.blade.php`:

```html
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Page title is set per-page via Inertia's <Head> component --}}
    <title inertia>{{ config('app.name', 'Learning Solutions System') }}</title>

    {{-- Fonts — replace with your preferred typeface --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

    {{-- Vite: CSS entry + TypeScript entry --}}
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/ts/app.tsx'])

    {{-- Inertia: per-page <head> tags (title, meta) --}}
    @inertiaHead
</head>
<body class="h-full font-sans antialiased">

    {{-- Inertia mounts the React app here --}}
    @inertia

</body>
</html>
```

---

## 20. Route Organization

### Create the route files

```bash
touch routes/admin.php
touch routes/trainer.php
touch routes/trainee.php
```

### routes/web.php

```php
<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes — Learning Solutions System
|--------------------------------------------------------------------------
*/

// ── Public Landing Page ──────────────────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

// ── Breeze Auth Routes ────────────────────────────────────────────────────────
// Provides: login, register, email verification, password reset
require __DIR__.'/auth.php';

// ── Authenticated Routes ──────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard — all roles land here after login
    // TODO: Build resources/ts/pages/Dashboard/Index.tsx
    // TODO: Build app/Http/Controllers/DashboardController.php
    //       - Show role-specific widgets (admin sees all stats, trainee sees own progress)
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/Index');
    })->name('dashboard');

    // ── Role-specific route groups ─────────────────────────────────────────
    require __DIR__.'/admin.php';
    require __DIR__.'/trainer.php';
    require __DIR__.'/trainee.php';
});
```

### routes/admin.php

```php
<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
| Middleware: auth + verified + role:admin
| URL prefix: /admin/...
| Route name prefix: admin.
|--------------------------------------------------------------------------
*/

Route::middleware(['role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

    // ── User Management ────────────────────────────────────────────────────
    // TODO: Create app/Http/Controllers/Admin/UserController.php
    // TODO: Create resources/ts/pages/Admin/Users/ (Index, Create, Edit, Show)
    // Route::resource('users', \App\Http\Controllers\Admin\UserController::class);

    // ── Role & Permission Management ───────────────────────────────────────
    // TODO: Create app/Http/Controllers/Admin/RoleController.php
    // TODO: Create resources/ts/pages/Admin/Roles/ (Index, Create, Edit)
    // Route::resource('roles', \App\Http\Controllers\Admin\RoleController::class);

    // ── Course Management ──────────────────────────────────────────────────
    // TODO: Create app/Http/Controllers/Admin/CourseController.php
    // TODO: Create resources/ts/pages/Admin/Courses/ (Index, Create, Edit, Show)
    // Route::resource('courses', \App\Http\Controllers\Admin\CourseController::class);

    // ── Batch Management ───────────────────────────────────────────────────
    // TODO: Create app/Http/Controllers/Admin/BatchController.php
    // TODO: Create resources/ts/pages/Admin/Batches/ (Index, Create, Edit, Show)
    // Route::resource('batches', \App\Http\Controllers\Admin\BatchController::class);

    // ── Trainee Management ─────────────────────────────────────────────────
    // TODO: Create app/Http/Controllers/Admin/TraineeController.php
    // TODO: Create resources/ts/pages/Admin/Trainees/ (Index, Show)
    // Route::resource('trainees', \App\Http\Controllers\Admin\TraineeController::class);

    // ── Reports & Analytics ────────────────────────────────────────────────
    // TODO: Create app/Http/Controllers/Admin/ReportController.php
    // TODO: Create resources/ts/pages/Admin/Reports/ (Index, Completion, Progress)
    // Route::get('reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])
    //     ->name('reports.index');

    // ── System Settings ────────────────────────────────────────────────────
    // TODO: Create resources/ts/pages/Admin/Settings/Index.tsx
    // Route::get('settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])
    //     ->name('settings');

    // ── Certificate Management ─────────────────────────────────────────────
    // TODO: Route::resource('certificates', ...)
});
```

### routes/trainer.php

```php
<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Trainer Routes
| Middleware: auth + verified + role:trainer
| URL prefix: /trainer/...
| Route name prefix: trainer.
|--------------------------------------------------------------------------
*/

Route::middleware(['role:trainer'])
    ->prefix('trainer')
    ->name('trainer.')
    ->group(function () {

    // ── My Batches ─────────────────────────────────────────────────────────
    // TODO: Create app/Http/Controllers/Trainer/BatchController.php
    // TODO: Create resources/ts/pages/Trainer/Batches/ (Index, Show)
    // Route::resource('batches', \App\Http\Controllers\Trainer\BatchController::class)
    //     ->only(['index', 'show']);

    // ── Trainee Progress Monitoring ────────────────────────────────────────
    // TODO: Create app/Http/Controllers/Trainer/TraineeController.php
    // TODO: Create resources/ts/pages/Trainer/Trainees/ (Index, Show)
    // Route::get('trainees', [\App\Http\Controllers\Trainer\TraineeController::class, 'index'])
    //     ->name('trainees.index');

    // ── Module & Lesson Management ─────────────────────────────────────────
    // TODO: Trainers can manage lessons in their assigned courses
    // Route::resource('modules', \App\Http\Controllers\Trainer\ModuleController::class);
    // Route::resource('lessons', \App\Http\Controllers\Trainer\LessonController::class);

    // ── Assessment Management ──────────────────────────────────────────────
    // TODO: Route::resource('assessments', ...)

    // ── Attendance Tracking ────────────────────────────────────────────────
    // TODO: Route::resource('attendance', ...)

    // ── Trainer Reports ────────────────────────────────────────────────────
    // TODO: View progress of their own batch's trainees
    // Route::get('reports', [\App\Http\Controllers\Trainer\ReportController::class, 'index'])
    //     ->name('reports');
});
```

### routes/trainee.php

```php
<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Trainee Routes
| Middleware: auth + verified + role:trainee
| URL prefix: /trainee/...
| Route name prefix: trainee.
|--------------------------------------------------------------------------
*/

Route::middleware(['role:trainee'])
    ->prefix('trainee')
    ->name('trainee.')
    ->group(function () {

    // ── My Enrollments ─────────────────────────────────────────────────────
    // TODO: Create app/Http/Controllers/Trainee/EnrollmentController.php
    // TODO: Create resources/ts/pages/Trainee/Enrollments/ (Index, Show)
    // Route::resource('enrollments', \App\Http\Controllers\Trainee\EnrollmentController::class)
    //     ->only(['index', 'show']);

    // ── Course Catalog ─────────────────────────────────────────────────────
    // TODO: Browse available courses/batches to enroll in
    // Route::get('catalog', [\App\Http\Controllers\Trainee\CatalogController::class, 'index'])
    //     ->name('catalog');

    // ── Lesson Player ──────────────────────────────────────────────────────
    // TODO: Create resources/ts/pages/Trainee/Lessons/Show.tsx
    // Route::get('lessons/{lesson}', [\App\Http\Controllers\Trainee\LessonController::class, 'show'])
    //     ->name('lessons.show');

    // ── Assessments / Quizzes ──────────────────────────────────────────────
    // TODO: Take quizzes, submit assignments
    // Route::get('assessments/{assessment}', [\App\Http\Controllers\Trainee\AssessmentController::class, 'show'])
    //     ->name('assessments.show');
    // Route::post('assessments/{assessment}/submit', [\App\Http\Controllers\Trainee\AssessmentController::class, 'submit'])
    //     ->name('assessments.submit');

    // ── My Progress ───────────────────────────────────────────────────────
    // TODO: Personal progress dashboard
    // Route::get('progress', [\App\Http\Controllers\Trainee\ProgressController::class, 'index'])
    //     ->name('progress');

    // ── Certificates ──────────────────────────────────────────────────────
    // TODO: Download earned certificates
    // Route::get('certificates', [\App\Http\Controllers\Trainee\CertificateController::class, 'index'])
    //     ->name('certificates.index');
});
```

---

## 21. SQLite for Development

The installer already created the SQLite file and ran migrations. Just verify:

```bash
# Confirm connection
grep DB_CONNECTION .env
# DB_CONNECTION=sqlite

# Confirm file exists
ls database/database.sqlite
# Should exist

# If missing, recreate
touch database/database.sqlite
```

---

## 22. PostgreSQL for Production

**Run these on your production server only — not on your local machine.**

### On the production server

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user and database
sudo -u postgres psql << 'SQL'
CREATE USER lss_user WITH PASSWORD 'use_a_very_strong_unique_password_here';
CREATE DATABASE lss_production OWNER lss_user;
GRANT ALL PRIVILEGES ON DATABASE lss_production TO lss_user;
\q
SQL
```

### Production .env

```dotenv
APP_NAME="Learning Solutions System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Switch to PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=lss_production
DB_USERNAME=lss_user
DB_PASSWORD=use_a_very_strong_unique_password_here

# Use Redis for session/cache/queue in production
SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

No code changes needed — the switch is purely via `.env`.

---

## 23. Roles, Permissions & Seeders

### Create the Permission Seeder

```bash
php artisan make:seeder PermissionSeeder
```

Replace `database/seeders/PermissionSeeder.php`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Clear Spatie's cache before seeding
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ────────────────────────────────────────────────────────────────────
        // DEFINE ALL SYSTEM PERMISSIONS
        // ────────────────────────────────────────────────────────────────────
        // TODO: Add or remove permissions as your system grows.
        // Convention: "verb noun" — e.g. "view trainees", "manage batches"
        // ────────────────────────────────────────────────────────────────────
        $permissions = [
            // User & Role Management
            'view users',
            'manage users',
            'manage roles',

            // Course Management
            'view courses',
            'create courses',
            'edit courses',
            'delete courses',
            'publish courses',

            // Batch Management
            'view batches',
            'create batches',
            'edit batches',
            'delete batches',
            'assign trainers',

            // Trainee Management
            'view trainees',
            'manage trainees',
            'enroll trainees',

            // Module & Lesson
            'manage modules',
            'manage lessons',

            // Assessments
            'manage assessments',
            'take assessments',
            'view assessment results',

            // Attendance
            'manage attendance',
            'view attendance',

            // Progress & Reports
            'view all reports',
            'view own reports',
            'view batch reports',

            // Certificates
            'manage certificates',
            'view own certificates',

            // Settings
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // ────────────────────────────────────────────────────────────────────
        // DEFINE ROLES & ASSIGN PERMISSIONS
        // ────────────────────────────────────────────────────────────────────

        // ── Admin — full system access ─────────────────────────────────────
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(Permission::all());

        // ── Trainer — manages their assigned batches and trainees ──────────
        $trainer = Role::firstOrCreate(['name' => 'trainer']);
        $trainer->syncPermissions([
            'view courses',
            'view batches',
            'view trainees',
            'manage modules',
            'manage lessons',
            'manage assessments',
            'view assessment results',
            'manage attendance',
            'view attendance',
            'view batch reports',
            'view own reports',
        ]);

        // ── Trainee — learns, takes assessments, views own progress ────────
        $trainee = Role::firstOrCreate(['name' => 'trainee']);
        $trainee->syncPermissions([
            'view courses',
            'view batches',
            'take assessments',
            'view attendance',
            'view own reports',
            'view own certificates',
        ]);

        // ────────────────────────────────────────────────────────────────────
        // TODO: Add more roles as your LSS grows. Examples:
        //
        // $coordinator = Role::firstOrCreate(['name' => 'coordinator']);
        // $coordinator->syncPermissions([...]);   // Schedules batches, assigns trainers
        //
        // $guest = Role::firstOrCreate(['name' => 'guest']);
        // $guest->syncPermissions(['view courses']); // Browse catalog only
        // ────────────────────────────────────────────────────────────────────
    }
}
```

### Create the Sample Data Seeder

```bash
php artisan make:seeder SampleDataSeeder
```

Replace `database/seeders/SampleDataSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ─────────────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@lss.test'],
            [
                'name'              => 'System Admin',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // ── Trainer ───────────────────────────────────────────────────────
        $trainer = User::firstOrCreate(
            ['email' => 'trainer@lss.test'],
            [
                'name'              => 'Sample Trainer',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $trainer->assignRole('trainer');

        // ── Trainee ───────────────────────────────────────────────────────
        $trainee = User::firstOrCreate(
            ['email' => 'trainee@lss.test'],
            [
                'name'              => 'Sample Trainee',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $trainee->assignRole('trainee');

        // ────────────────────────────────────────────────────────────────────
        // TODO: Add sample Courses, Batches, Enrollments, and Lessons here
        // once you create those models and migrations.
        // ────────────────────────────────────────────────────────────────────
    }
}
```

### Wire up DatabaseSeeder

Replace `database/seeders/DatabaseSeeder.php`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // IMPORTANT: PermissionSeeder MUST run before SampleDataSeeder.
        // SampleDataSeeder calls assignRole() — roles must exist first.
        $this->call([
            PermissionSeeder::class,
            SampleDataSeeder::class,
        ]);
    }
}
```

---

## 24. Run Migrations & Seeders

```bash
# Fresh migration — wipes and rebuilds all tables, then seeds
# Safe to run repeatedly on local dev
php artisan migrate:fresh --seed
```

Expected tables after migration:

- `users`, `password_reset_tokens`, `sessions`, `cache`, `jobs`
- `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`

**Test accounts after seeding:**

| Email            | Password | Role    |
| ---------------- | -------- | ------- |
| admin@lss.test   | password | admin   |
| trainer@lss.test | password | trainer |
| trainee@lss.test | password | trainee |

---

## 25. Complete Folder Structure

The full annotated structure of your project after all steps are complete:

```
learning-solutions-system/
│
├── app/
│   ├── Actions/                         ← Single-responsibility action classes
│   │   └── (e.g. EnrollTraineeInBatch.php, IssueCertificate.php)
│   │
│   ├── Enums/                           ← PHP 8.4 backed enums
│   │   └── (TODO: BatchStatus.php, EnrollmentStatus.php, UserRole.php)
│   │
│   ├── Events/                          ← Domain events
│   │   └── (TODO: BatchCompleted.php, LessonFinished.php)
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/                   ← TODO: UserController, BatchController,
│   │   │   │                                     CourseController, ReportController
│   │   │   ├── Trainer/                 ← TODO: BatchController, TraineeController,
│   │   │   │                                     AssessmentController, AttendanceController
│   │   │   ├── Trainee/                 ← TODO: EnrollmentController, LessonController,
│   │   │   │                                     AssessmentController, CertificateController
│   │   │   └── Auth/                    ← Breeze (already scaffolded ✓)
│   │   │
│   │   ├── Middleware/
│   │   │   └── HandleInertiaRequests.php  ✓
│   │   │
│   │   └── Requests/                    ← Form Request validation classes
│   │       ├── Admin/
│   │       ├── Trainer/
│   │       └── Trainee/
│   │
│   ├── Jobs/                            ← (TODO: SendCertificateEmail, GenerateReport)
│   ├── Listeners/                       ← Event listeners
│   ├── Models/                          ← Eloquent models
│   │   └── User.php                     ✓ (HasRoles applied)
│   │   └── (TODO: Course, Batch, Module, Lesson, Enrollment,
│   │              Assessment, AssessmentQuestion, Attendance, Certificate)
│   │
│   ├── Notifications/                   ← (TODO: BatchStarting, AssessmentGraded)
│   ├── Policies/                        ← Authorization policies
│   │   └── (TODO: CoursePolicy, BatchPolicy, EnrollmentPolicy)
│   │
│   ├── Repositories/                    ← Data access layer (complex queries)
│   │   └── (TODO: ReportRepository, EnrollmentRepository)
│   │
│   └── Services/                        ← Business logic layer
│       └── (TODO: EnrollmentService, CertificateService, ProgressService)
│
├── bootstrap/
│   └── app.php                          ✓ (Inertia + Spatie middleware)
│
├── config/
│   └── permission.php                   ✓ (Spatie config)
│
├── database/
│   ├── factories/
│   ├── migrations/                      ✓ (Spatie migration included)
│   └── seeders/
│       ├── DatabaseSeeder.php           ✓
│       ├── PermissionSeeder.php         ✓ (admin, trainer, trainee roles)
│       └── SampleDataSeeder.php         ✓ (3 test users, one per role)
│
├── resources/
│   ├── css/
│   │   └── app.css                      ✓ (Tailwind v4 + design tokens)
│   │
│   └── ts/                              ← All TypeScript/React code
│       ├── app.tsx                      ✓ (Inertia entry point)
│       ├── bootstrap.ts                 ✓ (Axios global config)
│       │
│       ├── types/
│       │   ├── index.d.ts               ✓
│       │   ├── inertia.d.ts             ✓ (shared props: auth, flash)
│       │   └── models.d.ts              ✓ (User + TODO domain models)
│       │
│       ├── hooks/
│       │   ├── usePermissions.ts        ✓ (isAdmin, isTrainer, isTrainee, can)
│       │   └── useFlash.ts              ✓ (access flash messages)
│       │
│       ├── utils/
│       │   └── helpers.ts               ✓ (cn, formatDate, getInitials, truncate)
│       │
│       ├── constants/                   ← (TODO: roles.ts, routes.ts, statuses.ts)
│       │
│       ├── store/                       ← Global state (TODO: Zustand or React Context)
│       │
│       ├── services/                    ← Frontend API helpers per feature
│       │   └── (TODO: batchService.ts, enrollmentService.ts)
│       │
│       ├── components/
│       │   ├── ui/                      ← Primitive components (no business logic)
│       │   │   └── (TODO: Button, Input, Modal, Badge, Avatar,
│       │   │              Dropdown, Pagination, DataTable, Alert)
│       │   │
│       │   ├── forms/                   ← Reusable form components
│       │   │   └── (TODO: TextField, SelectField, DateField, FileField)
│       │   │
│       │   └── shared/                  ← App-wide UI
│       │       └── (TODO: Sidebar, Topbar, Breadcrumb, FlashMessage,
│       │                   ConfirmDeleteModal, RoleBadge, UserAvatar)
│       │
│       ├── layouts/
│       │   ├── AppLayout.tsx            ← TODO: Authenticated layout (sidebar + topbar)
│       │   ├── AuthLayout.tsx           ← TODO: Centered card for login/register
│       │   └── GuestLayout.tsx          ← Breeze provides this ✓
│       │
│       ├── features/                    ← Feature-based co-location (recommended)
│       │   │                               Each feature owns its own components,
│       │   │                               hooks, and types — no global imports needed
│       │   ├── courses/
│       │   │   ├── components/          ← CourseCard, CourseThumbnail
│       │   │   ├── hooks/               ← useCourseForm, useCourseList
│       │   │   └── types.ts
│       │   ├── batches/
│       │   │   ├── components/          ← BatchStatusBadge, BatchProgress
│       │   │   ├── hooks/               ← useBatchForm
│       │   │   └── types.ts
│       │   ├── assessments/
│       │   └── reports/
│       │
│       └── pages/                       ← One file per route (Inertia convention)
│           │
│           ├── Home.tsx                 ← Public landing page
│           │
│           ├── Dashboard/
│           │   └── Index.tsx            ← TODO: Role-aware dashboard
│           │
│           ├── Auth/                    ← Breeze pages (already scaffolded ✓)
│           │   ├── Login.tsx
│           │   ├── Register.tsx
│           │   ├── ForgotPassword.tsx
│           │   └── ResetPassword.tsx
│           │
│           ├── Admin/
│           │   ├── Users/               ← TODO: Index, Create, Edit, Show
│           │   ├── Roles/               ← TODO: Index, Create, Edit
│           │   ├── Courses/             ← TODO: Index, Create, Edit, Show
│           │   ├── Batches/             ← TODO: Index, Create, Edit, Show
│           │   ├── Trainees/            ← TODO: Index, Show (progress overview)
│           │   ├── Reports/             ← TODO: Index, Completion, Progress
│           │   └── Settings/            ← TODO: Index
│           │
│           ├── Trainer/
│           │   ├── Batches/             ← TODO: Index, Show (my batches)
│           │   ├── Trainees/            ← TODO: Index, Show (my batch trainees)
│           │   ├── Lessons/             ← TODO: Index, Create, Edit
│           │   ├── Assessments/         ← TODO: Index, Create, Edit, Results
│           │   ├── Attendance/          ← TODO: Index, Mark
│           │   └── Reports/             ← TODO: Batch progress report
│           │
│           └── Trainee/
│               ├── Enrollments/         ← TODO: Index, Show (my enrollments)
│               ├── Catalog/             ← TODO: Browse available courses/batches
│               ├── Lessons/             ← TODO: Show (lesson player)
│               ├── Assessments/         ← TODO: Show (take quiz/exam)
│               ├── Progress/            ← TODO: My learning progress
│               └── Certificates/        ← TODO: My earned certificates
│
├── routes/
│   ├── web.php                          ✓
│   ├── auth.php                         ✓ (Breeze auth routes)
│   ├── admin.php                        ✓
│   ├── trainer.php                      ✓
│   └── trainee.php                      ✓
│
├── .env                                 ✓
├── tsconfig.json                        ✓
├── vite.config.ts                       ✓
└── package.json
```

---

## 26. Run the Development Server

```bash
# Recommended — runs Laravel + Vite together via Composer
composer run dev

# Alternative — two separate terminals
# Terminal 1:
php artisan serve
# Terminal 2:
npm run dev
```

Open **http://localhost:8000**

You should see the Breeze landing page with **Log in** and **Register** links.

**Test your setup:**

1. Go to **http://localhost:8000/login**
2. Log in with `admin@lss.test` / `password`
3. You should be redirected to `/dashboard`
4. Check the browser console for any errors

---

## 27. Verify the Installation

```bash
# ── PHP & Laravel ──────────────────────────────────────────────────────────────
php -v                                  # PHP 8.4.x
php artisan --version                   # Laravel Framework 13.x.x
php artisan route:list                  # All routes listed including auth + role routes

# ── TypeScript — no errors expected ───────────────────────────────────────────
npx tsc --noEmit
# Should print nothing (zero errors)

# ── Confirm roles exist ────────────────────────────────────────────────────────
php artisan tinker --execute="
    echo implode(', ', \Spatie\Permission\Models\Role::pluck('name')->toArray());
"
# Expected: admin, trainer, trainee

# ── Confirm permission count ───────────────────────────────────────────────────
php artisan tinker --execute="
    echo \Spatie\Permission\Models\Permission::count() . ' permissions seeded';
"
# Expected: 27 permissions seeded (or however many you defined)

# ── Confirm admin user has roles ───────────────────────────────────────────────
php artisan tinker --execute="
    \$u = \App\Models\User::where('email', 'admin@lss.test')->first();
    echo implode(', ', \$u->getRoleNames()->toArray());
"
# Expected: admin

# ── Production build sanity check ─────────────────────────────────────────────
npm run build
# Should complete with no errors and output to public/build/
```

---

## 28. Git Setup

```bash
git init
git branch -M main
```

Add to `.gitignore`:

```bash
cat >> .gitignore << 'EOF'

# IDE
.vscode/settings.json
.idea/
.DS_Store
Thumbs.db

# Environment overrides
.env.local
.env.staging

# Coverage
coverage/
.nyc_output/
EOF
```

**Initial commit:**

```bash
git add .
git commit -m "chore: initial project bootstrap

Stack:
- Laravel 13 + PHP 8.4
- React 19 + TypeScript 5 (strict mode, noUncheckedIndexedAccess)
- Inertia.js v2 (per-page code splitting via import.meta.glob)
- Tailwind CSS v4.3 (CSS-first, design tokens)
- Breeze auth (login, register, email verification, password reset)
- Spatie Permission (admin, trainer, trainee roles + 27 permissions)
- SQLite (dev) / PostgreSQL (prod)
- Vite with 10 path aliases and manual vendor code splitting
- Split routes: admin.php, trainer.php, trainee.php
- usePermissions + useFlash hooks
- Typed Inertia shared props (auth.user with roles + permissions)"
```

---

## 29. VS Code & Prettier Setup

### .vscode/extensions.json

```json
{
    "recommendations": [
        "bmewburn.vscode-intelephense-client",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-typescript-next",
        "EditorConfig.EditorConfig",
        "onecentlin.laravel-blade",
        "amiralizadeh9480.laravel-extra-intellisense",
        "mikestead.dotenv",
        "eamodio.gitlens"
    ]
}
```

### .vscode/settings.json

```json
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.tabSize": 4,
    "[php]": {
        "editor.defaultFormatter": "bmewburn.vscode-intelephense-client",
        "editor.tabSize": 4
    },
    "tailwindCSS.experimental.classRegex": [
        ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
    ],
    "intelephense.environment.phpVersion": "8.4",
    "typescript.tsdk": "node_modules/typescript/lib",
    "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Install Prettier

```bash
npm install --save-dev prettier prettier-plugin-tailwindcss
```

**.prettierrc:**

```json
{
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "tabWidth": 4,
    "printWidth": 100,
    "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## 30. Where to Build Your Modules

Use this as your development roadmap. Build in this order — each step depends on the previous.

---

### Phase 1 — Foundation (You are here ✓)

- [x] Stack installed and configured
- [x] Breeze auth (Login, Register, Email Verification, Password Reset)
- [x] Spatie RBAC (Admin, Trainer, Trainee roles + permissions)
- [x] SQLite dev database with seeded test users

---

### Phase 2 — Shell & Navigation

**Goal:** A working app shell that all roles can use.

| What to Build                              | Where                                             |
| ------------------------------------------ | ------------------------------------------------- |
| `AppLayout.tsx` — sidebar + topbar         | `resources/ts/layouts/AppLayout.tsx`              |
| `Sidebar.tsx` — role-aware nav links       | `resources/ts/components/shared/Sidebar.tsx`      |
| `Topbar.tsx` — user avatar, logout         | `resources/ts/components/shared/Topbar.tsx`       |
| `FlashMessage.tsx` — success/error toasts  | `resources/ts/components/shared/FlashMessage.tsx` |
| `Dashboard/Index.tsx` — role-aware widgets | `resources/ts/pages/Dashboard/Index.tsx`          |
| `DashboardController.php`                  | `app/Http/Controllers/DashboardController.php`    |

**Tip:** In `Sidebar.tsx`, use `usePermissions()` to show/hide nav links per role:

```tsx
const { isAdmin, isTrainer } = usePermissions();
{
    isAdmin() && <NavLink href="/admin/users">Users</NavLink>;
}
{
    isTrainer() && <NavLink href="/trainer/batches">My Batches</NavLink>;
}
```

---

### Phase 3 — Course Management (Admin)

**Goal:** Admins can create and manage the course catalog.

| What to Build                | Where                                             |
| ---------------------------- | ------------------------------------------------- |
| `Course` model + migration   | `app/Models/Course.php`                           |
| `Module` model + migration   | `app/Models/Module.php`                           |
| `Lesson` model + migration   | `app/Models/Lesson.php`                           |
| `Admin/CourseController.php` | `app/Http/Controllers/Admin/CourseController.php` |
| `Admin/Courses/` pages       | `resources/ts/pages/Admin/Courses/`               |
| `features/courses/`          | `resources/ts/features/courses/`                  |
| `CoursePolicy.php`           | `app/Policies/CoursePolicy.php`                   |

---

### Phase 4 — Batch Management (Admin + Trainer)

**Goal:** Admins create batches, assign trainers. Trainers see their assigned batches.

| What to Build                 | Where                                              |
| ----------------------------- | -------------------------------------------------- |
| `Batch` model + migration     | `app/Models/Batch.php`                             |
| `Admin/BatchController.php`   | `app/Http/Controllers/Admin/BatchController.php`   |
| `Trainer/BatchController.php` | `app/Http/Controllers/Trainer/BatchController.php` |
| Admin Batch pages             | `resources/ts/pages/Admin/Batches/`                |
| Trainer Batch pages           | `resources/ts/pages/Trainer/Batches/`              |
| `features/batches/`           | `resources/ts/features/batches/`                   |

---

### Phase 5 — Trainee Enrollment (Admin + Trainee)

**Goal:** Admins enroll trainees into batches. Trainees see their enrollments.

| What to Build                      | Where                                                   |
| ---------------------------------- | ------------------------------------------------------- |
| `Enrollment` model + migration     | `app/Models/Enrollment.php`                             |
| `EnrollmentService.php`            | `app/Services/EnrollmentService.php`                    |
| `EnrollTraineeInBatch.php` action  | `app/Actions/EnrollTraineeInBatch.php`                  |
| `Admin/TraineeController.php`      | `app/Http/Controllers/Admin/TraineeController.php`      |
| `Trainee/EnrollmentController.php` | `app/Http/Controllers/Trainee/EnrollmentController.php` |
| Trainee Enrollment pages           | `resources/ts/pages/Trainee/Enrollments/`               |

---

### Phase 6 — Learning Experience (Trainee)

**Goal:** Trainees can access and complete lessons.

| What to Build                  | Where                                               |
| ------------------------------ | --------------------------------------------------- |
| `LessonProgress` model         | `app/Models/LessonProgress.php`                     |
| `Trainee/LessonController.php` | `app/Http/Controllers/Trainee/LessonController.php` |
| `Trainee/Lessons/Show.tsx`     | `resources/ts/pages/Trainee/Lessons/Show.tsx`       |
| `ProgressService.php`          | `app/Services/ProgressService.php`                  |
| `LessonCompleted` event        | `app/Events/LessonCompleted.php`                    |

---

### Phase 7 — Assessments (Trainer + Trainee)

**Goal:** Trainers create quizzes/exams. Trainees take them.

| What to Build                                                  | Where                                     |
| -------------------------------------------------------------- | ----------------------------------------- |
| `Assessment`, `AssessmentQuestion`, `AssessmentAttempt` models | `app/Models/`                             |
| `Trainer/AssessmentController.php`                             | Quiz builder backend                      |
| `Trainee/AssessmentController.php`                             | Quiz taking backend                       |
| `features/assessments/`                                        | `resources/ts/features/assessments/`      |
| Trainer Assessment pages                                       | `resources/ts/pages/Trainer/Assessments/` |
| Trainee Assessment pages                                       | `resources/ts/pages/Trainee/Assessments/` |

---

### Phase 8 — Attendance (Trainer)

| What to Build                      | Where                                    |
| ---------------------------------- | ---------------------------------------- |
| `Attendance` model + migration     | `app/Models/Attendance.php`              |
| `Trainer/AttendanceController.php` | `app/Http/Controllers/Trainer/`          |
| Attendance pages                   | `resources/ts/pages/Trainer/Attendance/` |

---

### Phase 9 — Reports & Analytics

| What to Build                    | Where                                     |
| -------------------------------- | ----------------------------------------- |
| `ReportRepository.php`           | `app/Repositories/ReportRepository.php`   |
| `Admin/ReportController.php`     | System-wide reports                       |
| `Trainer/ReportController.php`   | Per-batch reports                         |
| `Trainee/ProgressController.php` | Personal progress                         |
| Report pages per role            | `resources/ts/pages/Admin/Reports/`, etc. |

---

### Phase 10 — Certificates

| What to Build                   | Where                                      |
| ------------------------------- | ------------------------------------------ |
| `Certificate` model + migration | `app/Models/Certificate.php`               |
| `CertificateService.php`        | `app/Services/CertificateService.php`      |
| `IssueCertificate.php` action   | `app/Actions/IssueCertificate.php`         |
| `BatchCompleted` event          | `app/Events/BatchCompleted.php`            |
| Trainee certificate page        | `resources/ts/pages/Trainee/Certificates/` |

---

## 31. Production Deployment Checklist

```bash
# ── On the production server ───────────────────────────────────────────────────

# 1. Pull latest code
git pull origin main

# 2. PHP dependencies — no dev packages
composer install --no-dev --optimize-autoloader

# 3. Build frontend assets
npm ci
npm run build

# 4. Set production environment
cp .env.example .env
# Manually configure .env: APP_ENV=production, APP_DEBUG=false, pgsql credentials

# 5. Generate app key
php artisan key:generate

# 6. Run migrations
php artisan migrate --force

# 7. Seed roles & permissions (firstOrCreate — safe to run multiple times)
php artisan db:seed --class=PermissionSeeder

# 8. Cache everything for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan icons:cache  # if using icon packages

# 9. Set file permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# 10. Restart PHP-FPM
sudo systemctl restart php8.4-fpm

# 11. Verify
php artisan about
```

---

## 32. Daily Command Reference

```bash
# ── Start Development ──────────────────────────────────────────────────────────
composer run dev                            # Starts Laravel + Vite together

# ── Generate Files ─────────────────────────────────────────────────────────────
php artisan make:model Batch -mfs           # Model + Migration + Factory + Seeder
php artisan make:controller Admin/BatchController --resource --model=Batch
php artisan make:request Admin/StoreBatchRequest
php artisan make:policy BatchPolicy --model=Batch
php artisan make:seeder BatchSeeder
php artisan make:event BatchCompleted
php artisan make:listener SendBatchCompletionNotification --event=BatchCompleted
php artisan make:job IssueCertificateJob
php artisan make:notification CertificateIssued

# ── Database ───────────────────────────────────────────────────────────────────
php artisan migrate                         # Run pending migrations
php artisan migrate:fresh --seed            # Wipe + rebuild + seed (dev only)
php artisan db:seed --class=PermissionSeeder  # Re-seed permissions only

# ── Routes ────────────────────────────────────────────────────────────────────
php artisan route:list                      # All routes
php artisan route:list --path=admin         # Filter by prefix
php artisan route:list --name=trainer       # Filter by name

# ── TypeScript ────────────────────────────────────────────────────────────────
npx tsc --noEmit                            # Type check without emitting files
npm run build                               # Production build

# ── Cache Management ─────────────────────────────────────────────────────────
php artisan optimize:clear                  # Clear ALL caches (dev)
php artisan optimize                        # Cache ALL (prod)

# ── Tinker ───────────────────────────────────────────────────────────────────
php artisan tinker                          # Interactive PHP shell

# ── Testing ──────────────────────────────────────────────────────────────────
php artisan test                            # Run all tests
php artisan test --filter=BatchTest         # Run specific test
./vendor/bin/pest                           # Run Pest directly
```

---

_Guide version: 3.0 — June 2026_
_Stack: Laravel 13 · PHP 8.4 · React 19 · TypeScript 5 (strict) · Inertia.js v2_
_Tailwind CSS v4.3 · Breeze Auth · Spatie Permission · SQLite (dev) · PostgreSQL (prod)_
_Roles: Admin · Trainer · Trainee_