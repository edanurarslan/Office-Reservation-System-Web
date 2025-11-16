import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// Types
export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: keyof T, order: 'asc' | 'desc') => void;
  pagination?: boolean;
  pageSize?: number;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

// Main Table Component
export const Table = React.forwardRef<HTMLTableElement, TableProps<any>>(
  ({
    data,
    columns,
    onRowClick,
    selectable = false,
    onSelectionChange,
    sortBy,
    sortOrder = 'asc',
    onSort,
    pagination = true,
    pageSize = 10,
    striped = true,
    hoverable = true,
    compact = false,
  }, ref) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
    const [sortKey, setSortKey] = useState<keyof any | null>(sortBy || null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(sortOrder);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter data
    const filteredData = useMemo(() => {
      if (!searchTerm) return data;
      return data.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }, [data, searchTerm, columns]);

    // Sort data
    const sortedData = useMemo(() => {
      if (!sortKey) return filteredData;
      const sorted = [...filteredData].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    }, [filteredData, sortKey, sortDirection]);

    // Paginate data
    const paginatedData = useMemo(() => {
      if (!pagination) return sortedData;
      const start = currentPage * pageSize;
      return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize, pagination]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    // Handle sort
    const handleSort = (key: keyof any) => {
      if (sortKey === key) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortKey(key);
        setSortDirection('asc');
      }
      if (onSort) {
        onSort(key, sortKey === key ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
      }
    };

    // Handle row selection
    const handleSelectRow = (rowId: string | number, event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      const newSelected = new Set(selectedRows);
      if (event.target.checked) {
        newSelected.add(rowId);
      } else {
        newSelected.delete(rowId);
      }
      setSelectedRows(newSelected);
      if (onSelectionChange) {
        onSelectionChange(Array.from(newSelected));
      }
    };

    // Handle select all
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        const allIds = paginatedData.map((row, idx) => `${idx}-${row}`);
        setSelectedRows(new Set(allIds));
        if (onSelectionChange) {
          onSelectionChange(allIds);
        }
      } else {
        setSelectedRows(new Set());
        if (onSelectionChange) {
          onSelectionChange([]);
        }
      }
    };

    const getSizeClasses = () => compact ? 'text-sm' : 'text-base';
    const getPaddingClasses = () => compact ? 'px-3 py-2' : 'px-4 py-3';

    return (
      <div style={{ width: '100%' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search style={{ width: '18px', height: '18px', color: '#818cf8' }} />
          <input
            type="text"
            placeholder="Tabloda ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '2px solid #e0e7ff',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              outline: 'none',
            }}
            className="focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid #e0e7ff' }}>
          <table
            ref={ref}
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ background: '#eef2ff', borderBottom: '2px solid #e0e7ff' }}>
                {selectable && (
                  <th style={{ width: '40px', padding: getPaddingClasses() }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{
                      width: col.width,
                      padding: getPaddingClasses(),
                      textAlign: 'left',
                      fontWeight: 700,
                      color: '#312e81',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                    className={col.sortable ? 'hover:bg-indigo-100 transition-colors' : ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {col.header}
                      {col.sortable && sortKey === col.key && (
                        sortDirection === 'asc' ? (
                          <ChevronUp style={{ width: '16px', height: '16px' }} />
                        ) : (
                          <ChevronDown style={{ width: '16px', height: '16px' }} />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#818cf8',
                    }}
                  >
                    Veri bulunamadı
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      background: striped && idx % 2 === 0 ? '#f8fafc' : '#fff',
                      borderBottom: '1px solid #e0e7ff',
                      cursor: onRowClick ? 'pointer' : 'default',
                    }}
                    className={hoverable && onRowClick ? 'hover:bg-indigo-50 transition-colors' : ''}
                  >
                    {selectable && (
                      <td style={{ padding: getPaddingClasses(), width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(`${idx}-${row}`)}
                          onChange={(e) => handleSelectRow(`${idx}-${row}`, e)}
                          style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        style={{
                          padding: getPaddingClasses(),
                          color: '#312e81',
                        }}
                        className={getSizeClasses()}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1rem',
            padding: '1rem',
            borderTop: '1px solid #e0e7ff',
          }}>
            <div style={{ color: '#818cf8', fontSize: '0.95rem' }}>
              Toplam {sortedData.length} kayıt ({currentPage + 1} / {totalPages})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #e0e7ff',
                  background: '#fff',
                  borderRadius: '0.5rem',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 0 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                let pageNum = idx;
                if (totalPages > 5) {
                  if (currentPage < 3) {
                    pageNum = idx;
                  } else if (currentPage > totalPages - 3) {
                    pageNum = totalPages - 5 + idx;
                  } else {
                    pageNum = currentPage - 2 + idx;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #e0e7ff',
                      background: currentPage === pageNum ? '#6366f1' : '#fff',
                      color: currentPage === pageNum ? '#fff' : '#312e81',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: currentPage === pageNum ? 600 : 400,
                    }}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #e0e7ff',
                  background: '#fff',
                  borderRadius: '0.5rem',
                  cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Table.displayName = 'Table';
