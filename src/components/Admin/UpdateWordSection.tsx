import React, { useState } from "react";
import style from "@/components/Admin/UpdateWordSection.module.css";
import SearchField from "../Searchfield";
import EditWordForm from "./EditWordForm";

type SearchWordResult = {
    id: number;
    word: string;
    nationalWord: string | null;
};

type UpdateWordSectionProps = {
    loading: boolean;
    results: SearchWordResult[];
    query: string;
    searchError: string;
};

const UpdateWordSection: React.FC<UpdateWordSectionProps> = ({
    loading,
    results,
    query,
    searchError,
}) => {
    const [editWord, setEditWord] = useState<SearchWordResult | null>(null);

    const handleEdit = (word: SearchWordResult) => {
        setEditWord(word);
    };

    const handleClose = () => {
        setEditWord(null);
    };

    const handleUpdated = () => {
        setEditWord(null);
    };

    return (
        <div className={style.updateWordSection}>
            <h2>Uppdatera ett ord</h2>
            <hr />
            <br />
            <SearchField />
            <div className={style.updateWordSectionResults}>
                {loading && <p>Söker...</p>}
                {!loading && searchError && <p>{searchError}</p>}
                {!loading && results.length > 0 && (
                    <ul>
                        {results.map((word) => (
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
                                        nationalWord={word.nationalWord ?? ""}
                                        onClose={handleClose}
                                        onUpdated={handleUpdated}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {!loading &&
                    !searchError &&
                    query.length >= 2 &&
                    results.length === 0 && <p>Inga träffar.</p>}
            </div>
        </div>
    );
};

export default UpdateWordSection;
