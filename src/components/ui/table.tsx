import * as React from "react"

import { cn } from "../../lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium last:[&>tr]:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// RSuite-compatible Table components
const Column = ({ children, width: _width, flexGrow: _flexGrow }: any) => {
  return <>{children}</>;
};

const HeaderCell = ({ children, ...props }: any) => (
  <TableHead {...props}>
    {children}
  </TableHead>
);

const Cell = ({ children, dataKey: _dataKey, ...props }: any) => {
  if (typeof children === 'function') {
    return (
      <TableCell {...props}>
        {children}
      </TableCell>
    );
  }
  
  return (
    <TableCell {...props}>
      {children}
    </TableCell>
  );
};

// Enhanced Table component that processes Column children (RSuite compatibility)
const RSuiteTable = ({ children, data, bordered: _bordered, rowHeight: _rowHeight, ...props }: any) => {
  const columns = React.Children.toArray(children).filter((child: any) => 
    child?.type === Column
  );

  if (!data || data.length === 0) {
    return (
      <Table {...props}>
        <TableHeader>
          <TableRow>
            {columns.map((column: any, index) => {
              const headerCell = React.Children.toArray(column.props.children).find((child: any) => 
                React.isValidElement(child) && child?.type === HeaderCell
              );
              return (
                <HeaderCell key={index}>
                  {React.isValidElement(headerCell) ? (headerCell.props as any).children : ''}
                </HeaderCell>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-8">
              Keine Daten verfügbar
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table {...props}>
      <TableHeader>
        <TableRow>
          {columns.map((column: any, index) => {
            const headerCell = React.Children.toArray(column.props.children).find((child: any) => 
              React.isValidElement(child) && child?.type === HeaderCell
            );
            return (
              <HeaderCell key={index}>
                {React.isValidElement(headerCell) ? (headerCell.props as any).children : ''}
              </HeaderCell>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((rowData: any, rowIndex: number) => (
          <TableRow key={rowIndex}>
            {columns.map((column: any, colIndex) => {
              const cell = React.Children.toArray(column.props.children).find((child: any) => 
                React.isValidElement(child) && child?.type === Cell
              );
              
              if (!React.isValidElement(cell)) return <TableCell key={colIndex}></TableCell>;
              
              const cellProps = cell.props as any;
              
              // Handle function children
              if (typeof cellProps.children === 'function') {
                return (
                  <Cell key={colIndex}>
                    {cellProps.children(rowData)}
                  </Cell>
                );
              }
              
              // Handle dataKey
              if (cellProps.dataKey) {
                return (
                  <Cell key={colIndex}>
                    {rowData[cellProps.dataKey]}
                  </Cell>
                );
              }
              
              // Handle direct children
              return (
                <Cell key={colIndex}>
                  {cellProps.children}
                </Cell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Attach sub-components to RSuiteTable
RSuiteTable.Column = Column;
RSuiteTable.HeaderCell = HeaderCell;
RSuiteTable.Cell = Cell;

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  RSuiteTable as RSuiteCompatibleTable,
  Column,
  HeaderCell,
  Cell,
}