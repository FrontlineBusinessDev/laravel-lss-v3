# Graph Report - D:\laravel-inertia\laravel-lss-v3  (2026-07-11)

## Corpus Check
- Code-only scoped build: 292 in-scope source files (163 `.tsx` · 85 `.php` · 38 `.ts` · 6 `.jsx`). AST-only extraction — no LLM, **0 tokens**. Excluded: `node_modules`, `vendor`, generated Wayfinder helpers (`resources/js/{routes,actions,wayfinder}`), `docs/` (`.md` + screenshots).
- _(graphify's initial full-repo scan counted 471 files / ~605k words before the code-only scope filter was applied; that pre-filter figure does not describe this graph.)_

## Summary
- 1415 nodes · 3701 edges · 98 communities (75 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Core Models & Batch/Registration Backend
- Shared UI: Buttons & Modals
- Trainee & Reports Pages
- Assessment Forms & UI Utils
- Roles & Permissions (RBAC) Backend
- Certificates UI
- Settings Record Pages & Types
- Seminars UI
- Schedule & Calendar UI
- Biometrics UI
- Domain Types & Notifications Context
- Evaluation UI
- Batches UI & Data Hooks
- BaseController CRUD Core
- DataTable Type Definitions
- Inertia Responses & Academic Controllers
- DataTableField (Async Filters)
- Mock Data & Payment Computation
- API Fetch & Settings Pages
- Dashboard Widgets
- Academic Settings Controllers & Statuses
- Record Modal & Field Hooks
- Authorization Policies & User Model
- Trainee Detail Tabs
- Settings Layouts & Permission Hook
- Service Providers (Fortify/Inertia)
- Auth Pages & Router Compat
- Status Badge & Evaluation Answers UI
- Leave & Notifications UI
- User Management Controller
- DataTable Component Core
- Dashboard & Batches Context
- Partner Schools Backend
- Roles Management UI
- DataTableList Component
- Modal Center/Side & Behavior Hook
- Sidebar/TopBar & Auth Hook
- Inactive-Login Prevention & User Factory
- Confirm/Archive Modals & Scroll Lock
- useCrud Data Hook
- Academic Policies & Permissions
- Payment & Seminar Controllers
- App Shell & Layout
- Toast Hook & Components
- Trainee Controller
- User Policy
- Modal Context & Registry
- Academic Industry Policy
- Academic Program Policy
- Partner Schools Policy
- Skeleton Loaders
- Pagination Component
- Public Registration Page
- Behavioral Sheet Print
- Active-User Middleware
- useCurrentUrl Hook
- Cron Controller & Routes
- Home Controller
- Announcements Controller & Web Routes
- Batch Controller
- Attachment Viewer Modal
- useIsMobile Hook
- useModal Hook
- Biometrics Controller
- Certificate Controller
- Dashboard Controller
- Evaluation Controller
- Leave Controller
- Rating Controller
- Report Controller
- Schedule Controller
- Task Controller
- Ticket Classifier (Support)
- Flash Toast Hook
- useInitials Hook
- useMobileNavigation Hook
- Error 429 Page
- Inertia Page Props Types

## God Nodes (most connected - your core abstractions)
1. `cn()` - 138 edges
2. `User` - 64 edges
3. `useToast()` - 57 edges
4. `BaseController` - 52 edges
5. `useBatches()` - 51 edges
6. `Button` - 48 edges
7. `Trainee` - 47 edges
8. `Controller` - 37 edges
9. `Modal()` - 33 edges
10. `StatusBadge()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `EvaluationPage()` --calls--> `cn()`  [EXTRACTED]
  resources/js/pages/evaluation/index.tsx → resources/js/lib/utils.ts
- `ReportsPage()` --calls--> `cn()`  [EXTRACTED]
  resources/js/pages/reports/index.tsx → resources/js/lib/utils.ts
- `TraineeRowMenuProps` --references--> `Trainee`  [EXTRACTED]
  resources/js/pages/batches/TraineeRowMenu.tsx → resources/js/types.ts
- `BaseController` --inherits--> `Controller`  [EXTRACTED]
  app/Http/Controllers/BaseController.php → app/Http/Controllers/Controller.php
- `BatchesController` --inherits--> `BaseController`  [EXTRACTED]
  app/Http/Controllers/Batches/BatchesController.php → app/Http/Controllers/BaseController.php

## Import Cycles
- None detected.

## Communities (98 total, 23 thin omitted)

### Community 0 - "Core Models & Batch/Registration Backend"
Cohesion: 0.05
Nodes (36): BatchesController, Builder, JsonResponse, Model, Request, RedirectResponse, Request, PublicRegistrationController (+28 more)

### Community 1 - "Shared UI: Buttons & Modals"
Cohesion: 0.07
Nodes (45): Button, ButtonProps, SIZE_STYLES, VARIANT_STYLES, ConfirmDialog(), ConfirmDialogProps, InfoNote(), SelectFieldProps (+37 more)

### Community 2 - "Trainee & Reports Pages"
Cohesion: 0.10
Nodes (41): BatchesContextValue, computePaymentBreakdown(), AddAnnouncementModalProps, EditPaymentInfoModal(), EditPaymentInfoModalProps, PAYMENT_STATUSES, PaymentsPage(), PaymentDetailModal() (+33 more)

### Community 3 - "Assessment Forms & UI Utils"
Cohesion: 0.09
Nodes (33): Dropdown(), DropdownProps, RatingInput(), RatingInputProps, RatingStars(), RatingStarsProps, RowMenu(), RowMenuActionConfig (+25 more)

### Community 4 - "Roles & Permissions (RBAC) Backend"
Cohesion: 0.08
Nodes (19): Builder, JsonResponse, Model, Request, RoleController, Request, RoleResource, Request (+11 more)

### Community 5 - "Certificates UI"
Cohesion: 0.10
Nodes (31): LogoLockup(), LogoMark(), LogoProps, TooltipIconButton(), TooltipIconButtonProps, certificateCitations, CertificateBatchPrint(), CertificateDoc (+23 more)

### Community 6 - "Settings Record Pages & Types"
Cohesion: 0.09
Nodes (25): buildRecordMenu(), SettingsListHeader(), SettingsRow(), TextCell(), renderRow(), renderRow(), renderRow(), renderRow() (+17 more)

### Community 7 - "Seminars UI"
Cohesion: 0.11
Nodes (29): seminarParticipants, SeminarAnswerStat, CreateEditSeminarModal(), EMPTY_DRAFT, Props, SEMINAR_TYPES, SeminarDraft, TABS (+21 more)

### Community 8 - "Schedule & Calendar UI"
Cohesion: 0.12
Nodes (31): SchedulePage(), ViewMode, ScheduleEntryModal(), EMPTY_FILTERS, ScheduleFilters(), ScheduleFilterState, STATUS_LABELS, buildDayCoverageIndex() (+23 more)

### Community 9 - "Biometrics UI"
Cohesion: 0.12
Nodes (31): RFC-4180, batches, biometricImports, biometricRecords, computeHoursRendered(), isRecordFlagged(), trainees, BiometricsPrint() (+23 more)

### Community 10 - "Domain Types & Notifications Context"
Cohesion: 0.06
Nodes (35): NotificationsContext, NotificationsContextValue, notifications, AddEditCitationModalProps, LeaveDetailsModalProps, AcademicLevel, AcademicProgram, Announcement (+27 more)

### Community 11 - "Evaluation UI"
Cohesion: 0.11
Nodes (26): evaluationQuestions, evaluationResponses, questionSetsByCategory, seminars, AddEditQuestionModal(), AddEditQuestionModalProps, EMPTY, QuestionFormValues (+18 more)

### Community 12 - "Batches UI & Data Hooks"
Cohesion: 0.13
Nodes (25): SelectField(), ICON_COLOR, SystemToastProvider(), ToastContext, ToastContextValue, ToastItem, useToast(), VARIANT_ICON (+17 more)

### Community 13 - "BaseController CRUD Core"
Cohesion: 0.17
Nodes (5): BaseController, JsonResponse, Model, Request, Trainees

### Community 14 - "DataTable Type Definitions"
Cohesion: 0.11
Nodes (19): STATUS_STYLES, RecordModalProps, Toolbar(), ToolbarProps, ParsedApiError, AppTrainees, columns, fields (+11 more)

### Community 15 - "Inertia Responses & Academic Controllers"
Cohesion: 0.09
Nodes (12): InertiaPageType, Builder, AcademicController, Request, Request, SettingController, HandleInertiaRequests, Request (+4 more)

### Community 16 - "DataTableField (Async Filters)"
Cohesion: 0.16
Nodes (24): FetchingSpinner(), DEFAULT_TABS, StatusFilter(), StatusFilterProps, StatusFilterTab, StatusScope, containsFile(), DataTableField() (+16 more)

### Community 17 - "Mock Data & Payment Computation"
Cohesion: 0.08
Nodes (26): ACCOUNTING_QUESTIONS, autoComputePaymentFields(), buildAnswers(), computeAutoDiscountPercentage(), computeAutoTotalAmount(), countTraineesForSchool(), eq(), GENERAL_WRITTEN_QUESTIONS (+18 more)

### Community 18 - "API Fetch & Settings Pages"
Cohesion: 0.11
Nodes (22): getCsrfToken(), useToast(), ApiEnvelope, apiFetch(), ApiFetchInit, apiFetchJson(), readCookie(), xhrUpload() (+14 more)

### Community 19 - "Dashboard Widgets"
Cohesion: 0.10
Nodes (20): DonutChart(), Segment, EarningsCard(), formatPHP(), MiniCalendar(), MONTH_NAMES, toKey(), TYPE_DOT (+12 more)

### Community 20 - "Academic Settings Controllers & Statuses"
Cohesion: 0.12
Nodes (10): AcademicIndustryController, Model, AcademicLearningOutcomesController, Builder, Model, AcademicLevelController, Model, AcademicProgramController (+2 more)

### Community 21 - "Record Modal & Field Hooks"
Cohesion: 0.15
Nodes (18): ImageLightbox(), ImageLightboxProps, RecordModal(), isFieldDisabled(), AsyncSelectField(), valuesEqual(), emptyFileFieldValue, fileNameFromUrl() (+10 more)

### Community 22 - "Authorization Policies & User Model"
Cohesion: 0.12
Nodes (5): User, AcademicLearningOutcomesPolicy, BatchPolicy, PasswordSetupUrl, Authenticatable

### Community 23 - "Trainee Detail Tabs"
Cohesion: 0.10
Nodes (17): academicLevels, academicPrograms, industries, learningOutcomes, partnerSchools, AcademicInfoTab(), FormState, Tab (+9 more)

### Community 24 - "Settings Layouts & Permission Hook"
Cohesion: 0.16
Nodes (14): ErrorFallback(), ErrorFallbackProps, usePermission(), LayoutProps, NAV_LINKS, SettingsAcademicLayout(), LayoutProps, NAV_LINKS (+6 more)

### Community 25 - "Service Providers (Fortify/Inertia)"
Cohesion: 0.13
Nodes (6): LssLoginResponse, AppServiceProvider, FortifyServiceProvider, InertiaServiceProvider, LoginResponseContract, ServiceProvider

### Community 26 - "Auth Pages & Router Compat"
Cohesion: 0.16
Nodes (12): AuthLayout(), getTraineeBatchStatus(), Link(), LinkProps, NavLink(), NavLinkProps, useNavigate(), useParams() (+4 more)

### Community 27 - "Status Badge & Evaluation Answers UI"
Cohesion: 0.18
Nodes (12): STATUS_LABELS, STATUS_STYLES, StatusBadge(), Thumbnail(), ThumbnailProps, ScopeTab, groupAnswers(), IndividualAnswersModal() (+4 more)

### Community 28 - "Leave & Notifications UI"
Cohesion: 0.15
Nodes (15): useNotifications(), getLeaveDayCount(), useSearchParams(), Channel, NotificationsPanel(), EMPTY_FILTERS, Filters, LEAVE_TYPE_OPTIONS (+7 more)

### Community 29 - "User Management Controller"
Cohesion: 0.22
Nodes (4): Builder, JsonResponse, Model, UserController

### Community 30 - "DataTable Component Core"
Cohesion: 0.16
Nodes (10): TableLoading(), TableLoadingProps, ApiResponse, ColumnDef, DataTable(), DataTableProps, formatCell(), PaginationMeta (+2 more)

### Community 31 - "Dashboard & Batches Context"
Cohesion: 0.19
Nodes (14): BatchesContext, BatchesProvider(), CreateBatchInput, formatToday(), regLink(), currentUser, TODAY, DashboardPage() (+6 more)

### Community 32 - "Partner Schools Backend"
Cohesion: 0.30
Nodes (7): PartnerSchoolsController, JsonResponse, Model, Request, PartnerSchools, HandlesFileUploads, HasRoles

### Community 33 - "Roles Management UI"
Cohesion: 0.20
Nodes (11): RowMenuAction, cap(), columns, PROTECTED_ROLES, renderRow(), PermissionModules, prettify(), PROTECTED_ROLES (+3 more)

### Community 34 - "DataTableList Component"
Cohesion: 0.21
Nodes (9): DataTableList(), deriveFieldsFromColumns(), formatCell(), isFieldDisabled(), isFieldVisible(), RecordModal(), RecordModalProps, useDebouncedValue() (+1 more)

### Community 35 - "Modal Center/Side & Behavior Hook"
Cohesion: 0.23
Nodes (10): ModalCenter(), ModalCenterProps, ModalComponentProps, Size, WIDTHS, ModalSide(), ModalSideProps, Side (+2 more)

### Community 36 - "Sidebar/TopBar & Auth Hook"
Cohesion: 0.27
Nodes (9): NotificationBell(), timeAgoLabel(), NAV_ITEMS, SidebarProps, UserMenu(), TopBar(), AuthUser, initialsFor() (+1 more)

### Community 37 - "Inactive-Login Prevention & User Factory"
Cohesion: 0.24
Nodes (6): PreventInactiveLogin, EventServiceProvider, Attempting, UserFactory, Factory, Notifiable

### Community 38 - "Confirm/Archive Modals & Scroll Lock"
Cohesion: 0.26
Nodes (8): ConfirmArchiveAccountModal(), ConfirmArchiveAccountModalProps, ConfirmDeleteModal(), ConfirmDeleteModalProps, ConfirmInUseModal(), ConfirmInUseModalProps, InUseEntry, useScrollLock()

### Community 39 - "useCrud Data Hook"
Cohesion: 0.24
Nodes (9): buildFormData(), errorMessage(), hasBinaryFiles(), useCrud(), UseCrudOptions, UseCrudResult, ApiError, CrudQueryParams (+1 more)

### Community 41 - "Payment & Seminar Controllers"
Cohesion: 0.29
Nodes (5): Controller, PaymentController, Response, Response, SeminarController

### Community 42 - "App Shell & Layout"
Cohesion: 0.29
Nodes (6): appSettings, AppShell(), Sidebar(), NotificationsProvider(), ToastProvider(), AppLayout()

### Community 43 - "Toast Hook & Components"
Cohesion: 0.25
Nodes (6): ToastContext, ToastContextValue, ToastItem, ToastOptions, ToastVariant, variantStyles

### Community 44 - "Trainee Controller"
Cohesion: 0.36
Nodes (3): Model, Response, TraineeController

### Community 46 - "Modal Context & Registry"
Cohesion: 0.25
Nodes (5): ModalContext, ModalContextType, ModalKey, ModalRegistry, ModalState

### Community 51 - "Pagination Component"
Cohesion: 0.29
Nodes (4): PageBtnProps, PageNumbersProps, PaginationBar(), PaginationBarProps

### Community 52 - "Public Registration Page"
Cohesion: 0.29
Nodes (3): PublicBatch, RegisterForm, School

### Community 53 - "Behavioral Sheet Print"
Cohesion: 0.43
Nodes (5): BehavioralSheetPrint(), BehavioralSheetPrintProps, groupBySection(), BehavioralQuestion, BehavioralRating

### Community 54 - "Active-User Middleware"
Cohesion: 0.53
Nodes (4): EnsureUserIsActive, Request, Response, Closure

### Community 55 - "useCurrentUrl Hook"
Cohesion: 0.33
Nodes (4): IsCurrentOrParentUrlFn, IsCurrentUrlFn, UseCurrentUrlReturn, WhenCurrentUrlFn

### Community 57 - "Home Controller"
Cohesion: 0.60
Nodes (3): HomeController, RedirectResponse, Request

### Community 60 - "Attachment Viewer Modal"
Cohesion: 0.50
Nodes (4): AttachmentViewerModal(), humanSize(), Props, ViewableAttachment

### Community 61 - "useIsMobile Hook"
Cohesion: 0.70
Nodes (4): getServerSnapshot(), isSmallerThanBreakpoint(), mediaQueryListener(), useIsMobile()

### Community 62 - "useModal Hook"
Cohesion: 0.40
Nodes (3): ModalKey, ModalState, UseModalReturn

### Community 74 - "useInitials Hook"
Cohesion: 0.67
Nodes (3): getInitial(), GetInitialsFn, useInitials()

## Knowledge Gaps
- **213 isolated node(s):** `appSettings`, `ButtonProps`, `VARIANT_STYLES`, `SIZE_STYLES`, `ConfirmDialogProps` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Assessment Forms & UI Utils` to `Shared UI: Buttons & Modals`, `Trainee & Reports Pages`, `Certificates UI`, `Settings Record Pages & Types`, `Seminars UI`, `Schedule & Calendar UI`, `Biometrics UI`, `Evaluation UI`, `Batches UI & Data Hooks`, `DataTableField (Async Filters)`, `Dashboard Widgets`, `Trainee Detail Tabs`, `Settings Layouts & Permission Hook`, `Auth Pages & Router Compat`, `Status Badge & Evaluation Answers UI`, `Leave & Notifications UI`, `Dashboard & Batches Context`, `Roles Management UI`, `Sidebar/TopBar & Auth Hook`, `App Shell & Layout`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `User` connect `Authorization Policies & User Model` to `Core Models & Batch/Registration Backend`, `Partner Schools Backend`, `Roles & Permissions (RBAC) Backend`, `Inactive-Login Prevention & User Factory`, `Academic Policies & Permissions`, `User Policy`, `Academic Industry Policy`, `Academic Program Policy`, `Partner Schools Policy`, `User Management Controller`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `BaseController` connect `BaseController CRUD Core` to `Partner Schools Backend`, `Core Models & Batch/Registration Backend`, `Roles & Permissions (RBAC) Backend`, `Payment & Seminar Controllers`, `Inertia Responses & Academic Controllers`, `Academic Settings Controllers & Statuses`, `User Management Controller`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `appSettings`, `ButtonProps`, `VARIANT_STYLES` to the rest of the system?**
  _213 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core Models & Batch/Registration Backend` be split into smaller, more focused modules?**
  _Cohesion score 0.0518326545723806 - nodes in this community are weakly interconnected._
- **Should `Shared UI: Buttons & Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.07103825136612021 - nodes in this community are weakly interconnected._
- **Should `Trainee & Reports Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.09879336349924585 - nodes in this community are weakly interconnected._