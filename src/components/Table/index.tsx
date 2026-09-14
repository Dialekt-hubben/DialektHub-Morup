import styled from "./Table.module.css";

type Props = {
    title: string;
    actions?: React.ReactNode;
    headerColumns: string[];
    children: React.ReactNode;
};

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
    children: React.ReactNode;
};

function TableRow({ children }: { children: React.ReactNode }) {
    return <tr>{children}</tr>;
}

function TableCell({ children, ...cellProps }: TableCellProps) {
    return <td {...cellProps}>{children}</td>;
}

function Table({ title, actions, headerColumns, children }: Props) {
    return (
        <div className={styled.tableContainer}>
            <div>
                <h2>{title}</h2>

                {actions && <div className={styled.actions}>{actions}</div>}
            </div>
            <table className={styled.table}>
                <thead>
                    <TableRow>
                        {headerColumns.map((column) => (
                            <th key={column}>{column}</th>
                        ))}
                    </TableRow>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

export { Table, TableRow, TableCell };
