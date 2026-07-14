import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import type { Batch, StatusKind, Trainee } from '@/types';
import { batches as initialBatches, trainees as initialTrainees, TODAY } from '@/data/mockData';
export interface CreateBatchInput {
  setup: 'F2F' | 'Online';
  programType: string;
  industry: string;
}
interface BatchesContextValue {
  batches: Batch[];
  trainees: Trainee[];
  getBatch: (id: string) => Batch | undefined;
  getTraineesForBatch: (batchNo: string) => Trainee[];
  nextBatchNumber: () => string;
  createBatch: (input: CreateBatchInput) => Batch;
  updateBatch: (id: string, input: CreateBatchInput) => void;
  completeBatch: (id: string) => void;
  dissolveBatch: (id: string, remarks: string) => void;
  deleteBatch: (id: string) => void;
  transferTrainee: (traineeId: string, toBatchNo: string) => void;
  terminateTrainee: (traineeId: string, remarks: string) => void;
  archiveTrainee: (traineeId: string) => void;
  restoreTrainee: (traineeId: string) => void;
  setEvaluationAccessOverride: (traineeId: string, allowed: boolean) => void;
  /** Generic patch for fields not covered by a dedicated action above (e.g. payment records/info). */
  updateTrainee: (traineeId: string, patch: Partial<Trainee>) => void;
}
const BatchesContext = createContext<BatchesContextValue | null>(null);
function formatToday() {
  return TODAY.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
function regLink(batchNo: string) {
  return `https://register.lss-admin.app/b/${batchNo.toLowerCase()}`;
}
export function BatchesProvider({
  children
}: {
  children: ReactNode;
}) {
  const [batches, setBatches] = useState<Batch[]>(() => initialBatches.map(b => ({
    ...b,
    trainees: initialTrainees.filter(t => t.batchNo === b.batchNo && !t.archived).length
  })));
  const [trainees, setTrainees] = useState<Trainee[]>(initialTrainees);
  const nextBatchNumber = () => {
    const year = TODAY.getFullYear();
    const nums = batches.map(b => {
      const m = b.batchNo.match(/B-(\d{4})-(\d+)/);
      return m && Number(m[1]) === year ? Number(m[2]) : 0;
    }).filter(Boolean);
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `B-${year}-${String(next).padStart(3, '0')}`;
  };
  const createBatch = (input: CreateBatchInput) => {
    const batchNo = nextBatchNumber();
    const newBatch: Batch = {
      id: `b-${Date.now()}`,
      batchNo,
      programType: input.programType,
      industry: input.industry,
      setup: input.setup,
      trainees: 0,
      status: 'pending',
      started: '—',
      projectedEnd: '—',
      createdDate: formatToday(),
      registrationLink: regLink(batchNo)
    };
    setBatches(prev => [newBatch, ...prev]);
    return newBatch;
  };
  const updateBatch = (id: string, input: CreateBatchInput) => {
    setBatches(prev => prev.map(b => b.id === id ? {
      ...b,
      ...input
    } : b));
  };
  const completeBatch = (id: string) => {
    setBatches(prev => prev.map(b => b.id === id ? {
      ...b,
      status: 'completed' as StatusKind
    } : b));
  };
  const dissolveBatch = (id: string, remarks: string) => {
    setBatches(prev => prev.map(b => b.id === id ? {
      ...b,
      status: 'dissolved' as StatusKind,
      dissolvedRemarks: remarks
    } : b));
  };
  const deleteBatch = (id: string) => {
    const batch = batches.find(b => b.id === id);
    setBatches(prev => prev.filter(b => b.id !== id));
    if (batch) {
      setTrainees(prev => prev.filter(t => t.batchNo !== batch.batchNo));
    }
  };
  const recomputeCounts = (list: Trainee[]) => {
    setBatches(prev => prev.map(b => ({
      ...b,
      trainees: list.filter(t => t.batchNo === b.batchNo && !t.archived).length
    })));
  };
  const transferTrainee = (traineeId: string, toBatchNo: string) => {
    setTrainees(prev => {
      const next = prev.map(t => t.id === traineeId ? {
        ...t,
        batchNo: toBatchNo
      } : t);
      recomputeCounts(next);
      return next;
    });
  };
  const terminateTrainee = (traineeId: string, remarks: string) => {
    setTrainees(prev => {
      const next = prev.map(t => t.id === traineeId ? {
        ...t,
        status: 'terminated' as StatusKind,
        terminationRemarks: remarks
      } : t);
      recomputeCounts(next);
      return next;
    });
  };
  const archiveTrainee = (traineeId: string) => {
    setTrainees(prev => {
      const next = prev.map(t => t.id === traineeId ? {
        ...t,
        archived: true,
        statusBeforeArchive: t.status
      } : t);
      recomputeCounts(next);
      return next;
    });
  };
  const restoreTrainee = (traineeId: string) => {
    setTrainees(prev => {
      const next = prev.map(t => t.id === traineeId ? {
        ...t,
        archived: false,
        status: t.statusBeforeArchive ?? t.status
      } : t);
      recomputeCounts(next);
      return next;
    });
  };
  const setEvaluationAccessOverride = (traineeId: string, allowed: boolean) => {
    setTrainees(prev => prev.map(t => t.id === traineeId ? {
      ...t,
      evaluationAccessOverride: allowed
    } : t));
  };
  const updateTrainee = (traineeId: string, patch: Partial<Trainee>) => {
    setTrainees(prev => prev.map(t => t.id === traineeId ? {
      ...t,
      ...patch
    } : t));
  };
  const value = useMemo<BatchesContextValue>(() => ({
    batches,
    trainees,
    getBatch: id => batches.find(b => b.id === id),
    getTraineesForBatch: batchNo => trainees.filter(t => t.batchNo === batchNo),
    nextBatchNumber,
    createBatch,
    updateBatch,
    completeBatch,
    dissolveBatch,
    deleteBatch,
    transferTrainee,
    terminateTrainee,
    archiveTrainee,
    restoreTrainee,
    setEvaluationAccessOverride,
    updateTrainee
  }), [batches, trainees]);
  return <BatchesContext.Provider value={value} data-cy="batches-context-batches-context-provider-1">{children}</BatchesContext.Provider>;
}
export function useBatches() {
  const ctx = useContext(BatchesContext);
  if (!ctx) throw new Error('useBatches must be used within a BatchesProvider');
  return ctx;
}