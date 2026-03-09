import React, { useState } from "react";
import style from "@/components/UpdateWordSection.module.css";
import SearchField from "./Searchfield";
import EditWordForm from "./EditWordForm";

type UpdateWordSectionProps = {
    loading: boolean;
    results: any[];
    query: string;
};

const UpdateWordSection: React.FC<UpdateWordSectionProps> = ({
    loading,
    results,
    query,
}) => {
    const [editWord, setEditWord] = useState<any | null>(null);

    const handleEdit = (word: any) => {
        setEditWord(word);
    };

    const handleClose = () => {
        setEditWord(null);
    };

    // Optional: callback for after update
    const handleUpdated = () => {
        setEditWord(null);
        // Optionally: trigger reload of results here
    };

    return (
        <div className={style.updateWordSection}>
            <h2>Uppdatera ett ord</h2>
            <hr />
            <br />
            <SearchField />
            <div className={style.updateWordSectionResults}>
                {loading && <p>Söker...</p>}
                {!loading && results.length > 0 && (
                    <ul>
                        {results.map((word: any) => (
                            <li key={word.id}>
                                <b>{word.word}</b> - {word.nationalWord}{" "}
                                <button
                                    className="btn primary"
                                    onClick={() => handleEdit(word)}>
                                    edit
                                </button>
                                {editWord && editWord.id === word.id && (
                                    <EditWordForm
                                        id={word.id}
                                        dialectWord={word.word}
                                        nationalWord={word.nationalWord}
                                        onClose={handleClose}
                                        onUpdated={handleUpdated}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {!loading && query.length >= 2 && results.length === 0 && (
                    <p>Inga träffar.</p>
                )}
            </div>
        </div>
    );
};

export default UpdateWordSection;
