"use client";
import AddWordForm from "@/components/AddWordForm";
import { useState } from "react";
import style from "./adminView.module.css";
import SearchField from "@/components/Searchfield";

export default function AdminView() {
    const [selectedWord, setSelectedWord] = useState(null);

    return (
        <div>
            <h1>Admin View</h1>

            <div>
                <h2>Lägg till nytt ord</h2>
                <AddWordForm />
            </div>

            <div>
                <h2>Uppdatera ett ord</h2>
                <SearchField />
                <p>{selectedWord && `Valt ord: ${selectedWord}`}</p>
            </div>

            <div>
                <h2>Läs in en Excel-fil</h2>
                <input type="file" accept=".xlsx,.xls,.csv" />
                <button>Importera Excel</button>
            </div>
        </div>
    );
}
