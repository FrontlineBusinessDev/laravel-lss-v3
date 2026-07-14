import React from 'react';
interface TableLoadingProps {
  count?: number;
  cols?: number;
  className?: string;
}
const TableLoading: React.FC<TableLoadingProps> = ({
  count = 0,
  cols = 1,
  className = 'h-1.75'
}) => {
  const adjustedCount = (() => {
    let total = count;
    while (cols > 0 && total % cols !== 0) {
      total++;
    }
    return total;
  })();
  const box = [];
  for (let i = 1; i <= adjustedCount; i++) {
    box.push(<div key={i} className={`${className} loading-bar relative w-full overflow-hidden rounded-md bg-gray-300 p-1.5`} data-cy="table-loading-div-1" />);
  }
  if (cols === 0) {
    return null;
  }
  return <div className="grid gap-2 p-2 md:gap-4" style={{
    gridTemplateColumns: `repeat(${cols}, 1fr)`
  }} data-cy="table-loading-div-2">
            {box}
        </div>;
};
export default TableLoading;