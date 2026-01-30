"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Pagination from "../components/Pagination";
import Table from "@/components/Table";

const headers = [
  "Ord",
  "Ljudfil",
  "Uttal",
  "Användare",
  "Svenska",
];

const PAGE_SIZE = 10; // Antal poster per sida

export default function Home() {
  const [data, setData] = useState([]); // Data för den aktuella sidan
  const [total, setTotal] = useState(0); // Totalt antal poster, används för att beräkna totala sidor
  const [page, setPage] = useState(1); // börjar på sida 1
  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/dialectwords?page=${page}&pageSize=${PAGE_SIZE}`);
      const result = await res.json();
      setData(result.data || []);
      setTotal(result.total || 0);
    }
    fetchData();
  }, [page]);

  return (
    <main>
      <div className={styles.tableContainerWrapper}>
        <div>
          <div className={styles.tableContainer}>
            <h2 className={styles.tableHeader}>Ordlista</h2>
            <Table headers={headers} data={data} />
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </div>
    </main>
  );
}
