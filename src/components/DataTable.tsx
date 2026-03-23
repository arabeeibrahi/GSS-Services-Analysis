import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
  ColumnResizeMode,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from './SummaryCard';

interface DataTableProps {
  data: any[];
  theme?: 'blue' | 'green';
}

export function DataTable({ data, theme = 'blue' }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');

  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (!data || data.length === 0) return [];
    // Get all unique keys from the first 100 rows to ensure we capture all columns
    const keys = new Set<string>();
    data.slice(0, 100).forEach(row => Object.keys(row).forEach(k => keys.add(k)));
    
    return Array.from(keys).map((key) => ({
      header: key,
      accessorKey: key,
      cell: info => {
        const val = info.getValue();
        return val !== null && val !== undefined ? String(val) : '';
      },
      size: 150, // Default column width
      minSize: 50,
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode,
  });

  if (!data || data.length === 0) return null;

  const headerColor = theme === 'blue' ? 'text-[#003366]' : 'text-[#006633]';
  const borderColor = theme === 'blue' ? 'border-[#0066cc]' : 'border-[#009966]';
  const resizerColor = theme === 'blue' ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-8">
      <h2 className={cn("text-2xl font-bold mb-6 border-b-4 pb-3 inline-block", headerColor, borderColor)}>
        Raw Data View
      </h2>
      
      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table 
          className="w-full text-sm text-left table-fixed" 
          style={{ width: table.getCenterTotalSize() }}
        >
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 relative group select-none whitespace-nowrap font-semibold border-r border-gray-200 last:border-r-0"
                    style={{ width: header.getSize() }}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between gap-2 cursor-pointer hover:text-gray-900 transition-colors",
                        header.column.getCanSort() ? "cursor-pointer" : ""
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="truncate">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </span>
                      <span className="flex-shrink-0 text-gray-400">
                        {{
                          asc: <ChevronUp className="w-4 h-4 text-gray-700" />,
                          desc: <ChevronDown className="w-4 h-4 text-gray-700" />,
                        }[header.column.getIsSorted() as string] ?? (
                          header.column.getCanSort() ? <ChevronsUpDown className="w-4 h-4 opacity-0 group-hover:opacity-50" /> : null
                        )}
                      </span>
                    </div>
                    
                    {/* Resizer */}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={cn(
                        "absolute right-0 top-0 h-full w-1 cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity",
                        header.column.getIsResizing() ? `opacity-100 ${resizerColor}` : "bg-gray-300 hover:bg-gray-400"
                      )}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 truncate border-r border-gray-100 last:border-r-0"
                    style={{ width: cell.column.getSize() }}
                    title={String(cell.getValue() || '')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            Page <strong className="text-gray-900">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
            <strong className="text-gray-900">{table.getPageCount()}</strong>
          </span>
          <span className="h-4 w-px bg-gray-300"></span>
          <span className="flex items-center gap-2">
            Show
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
              className="border border-gray-300 rounded-md text-sm p-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {[10, 20, 30, 40, 50, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="First Page"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title="Last Page"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
