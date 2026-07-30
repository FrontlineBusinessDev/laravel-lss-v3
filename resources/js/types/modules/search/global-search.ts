/**
 * @file types/modules/search/global-search.ts
 * Response shape for GET /search (app/Http/Controllers/v1/GlobalSearchController.php).
 */

export interface GlobalSearchResult {
    id: number | string;
    label: string;
    subtitle: string;
    url: string;
}

export interface GlobalSearchGroup {
    key: string;
    label: string;
    results: GlobalSearchResult[];
}
