/**
 * @file api-service-layer/admin/academic.ts
 * The four Academic settings resources under `/settings/academic/*`
 * (all crudModule). Grouped in one module since each is a one-line binding.
 */

import type { AcademicIndustry } from '@/types/modules/settings/academic/industry';
import type { AcademicLearningOutcomes } from '@/types/modules/settings/academic/learning-outcomes';
import type { AcademicLevel } from '@/types/modules/settings/academic/level';
import type { AcademicProgram } from '@/types/modules/settings/academic/program';
import { createCrudResource } from '../http';

export const academicIndustryService = createCrudResource<
    AcademicIndustry,
    Partial<AcademicIndustry>
>({ baseUrl: '/settings/academic/industry' });

export const academicLearningOutcomesService = createCrudResource<
    AcademicLearningOutcomes,
    Partial<AcademicLearningOutcomes>
>({ baseUrl: '/settings/academic/learning-outcomes' });

export const academicLevelService = createCrudResource<
    AcademicLevel,
    Partial<AcademicLevel>
>({ baseUrl: '/settings/academic/level' });

export const academicProgramService = createCrudResource<
    AcademicProgram,
    Partial<AcademicProgram>
>({ baseUrl: '/settings/academic/program' });
