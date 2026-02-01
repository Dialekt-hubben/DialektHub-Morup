"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Pagination from "../components/Pagination";
import Table from "@/components/Table";

// Main Page-component
export default function Home() {
  const [data, setData] = useState([]); // Data for current page
  const [total, setTotal] = useState(0); // Total number of rows in the database
  const [page, setPage] = useState(1); // Current page
  const PAGE_SIZE = 10; // Amount of rows per page
  const totalPages = Math.ceil(total / PAGE_SIZE); // Calculate total number of pages
  
  // Runs when "page" changes (or on first render)
  useEffect(() => {
    async function fetchData() {
    
    // Fetch data from the API with page number and page size
    const res = await fetch(`/api/dialectwords?page=${page}&pageSize=${PAGE_SIZE}`);
    const result = await res.json();
    console.log("Fetched data:", result); // (Debug) Show fetched data in the console
    
    // Save data and total variables from the API response
    setData(result.data || []);
    setTotal(result.total || 0);
    }
    fetchData();
  }, [page]);

  return (
    <main>
      <div className={styles.tableContainerWrapper}>
          <div className={styles.tableContainer}>
            <h2 className={styles.tableHeader}>Ordlista</h2>
            <Table data={data} />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
      </div>
    </main>
  );
}