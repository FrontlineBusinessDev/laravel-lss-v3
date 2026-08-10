<?php

namespace App\Http\Controllers\v1\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * Per-filter-type query application logic used by
 * BaseController::paginationSearch(). Extracted verbatim (no behavior
 * change) from BaseController to keep that class under the project's
 * file-length limit — each method here is a 1:1 move of what was
 * previously inlined in the filters loop or at the bottom of the class.
 */
trait AppliesQueryFilters
{
    /**
     * Applies a filter declared in $relationFilters via whereHas, traversing
     * a dot-path of relation names down to the final column.
     */
    protected function applyRelationFilter(Builder $query, string $path, mixed $value): void
    {
        $segments = explode('.', $path);
        $column = array_pop($segments);
        $this->nestedWhereHas($query, $segments, $column, $value);
    }

    /** @param list<string> $relations */
    protected function nestedWhereHas(Builder $query, array $relations, string $column, mixed $value): void
    {
        $relation = array_shift($relations);
        $query->whereHas($relation, function (Builder $q) use ($relations, $column, $value) {
            if (empty($relations)) {
                is_array($value) ? $q->whereIn($column, $value) : $q->where($column, $value);

                return;
            }
            $this->nestedWhereHas($q, $relations, $column, $value);
        });
    }

    /**
     * Handles automatic dynamic date filters declared in $dateFilters.
     */
    protected function applyDateFilter(Builder $query, string $filterKey, mixed $value): void
    {
        if (empty($value)) {
            return;
        }
        $column = $this->dateFilters[$filterKey];
        if (str_ends_with($filterKey, '_from') || str_ends_with($filterKey, '_start')) {
            $query->whereDate($column, '>=', $value);
        } elseif (str_ends_with($filterKey, '_to') || str_ends_with($filterKey, '_end')) {
            $query->whereDate($column, '<=', $value);
        } else {
            $query->whereDate($column, '=', $value);
        }
    }

    /**
     * Filter keys that live on a JSON array column (declared in
     * $jsonContainsFilters): a multi-select value matches if the column's
     * JSON array contains ANY of the given values.
     */
    protected function applyJsonContainsFilter(Builder $query, string $jsonColumn, mixed $cleanedValue): void
    {
        $values = is_array($cleanedValue) ? $cleanedValue : [$cleanedValue];
        $query->where(function (Builder $q) use ($jsonColumn, $values) {
            foreach ($values as $value) {
                // Stored JSON array elements are typically ints (IDs);
                // coerce so a string id from the request still matches.
                $q->orWhereJsonContains($jsonColumn, is_numeric($value) ? (int) $value : $value);
            }
        });
    }

    /**
     * Default filter application for a plain column: multi-select values
     * match via whereIn, $exactFilters columns match exactly, everything
     * else matches via LIKE.
     */
    protected function applyStandardFilter(Builder $query, string $col, mixed $cleanedValue): void
    {
        if (is_array($cleanedValue)) {
            // Multi-select filter — match any of the given values.
            $query->whereIn($col, $cleanedValue);
        } elseif (in_array($col, $this->exactFilters, true)) {
            // Exact match for columns like `status` (so 'active' doesn't
            // also match 'inactive'); LIKE for everything else.
            $query->where($col, $cleanedValue);
        } else {
            $query->where($col, 'like', "%{$cleanedValue}%");
        }
    }

    /**
     * Sort keys declared in $relationSortable order by a column on a
     * related table (joined in) instead of this model's own column.
     */
    protected function applyRelationSort(Builder $query, string $sortBy, string $sortDir): void
    {
        [$joinTable, $joinColumn] = $this->relationSortable[$sortBy];
        $localTable = $query->getModel()->getTable();
        $query->leftJoin($joinTable, "{$localTable}.{$sortBy}", '=', "{$joinTable}.id")
            ->select("{$localTable}.*")
            ->orderBy("{$joinTable}.{$joinColumn}", $sortDir);
    }
}
