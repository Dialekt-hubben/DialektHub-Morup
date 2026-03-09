import { useState } from "react";

interface EditWordFormProps {
    id: string;
    dialectWord: string;
    nationalWord: string;
    onClose: () => void;
    onUpdated?: () => void;
}

export default function EditWordForm({
    id,
    dialectWord,
    nationalWord,
    onClose,
    onUpdated,
}: EditWordFormProps) {
    const [dialekt, setDialekt] = useState(dialectWord);
    const [national, setNational] = useState(nationalWord);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/dialectwords`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    dialectWord: dialekt,
                    nationalWord: national,
                }),
            });
            if (!res.ok) throw new Error("Kunde inte uppdatera ordet.");
            if (onUpdated) {
                onUpdated();
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Något gick fel.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ margin: "1em 0" }}>
            <div>
                <label>
                    Dialektord:
                    <input
                        type="text"
                        value={dialekt}
                        onChange={(e) => setDialekt(e.target.value)}
                        disabled={loading}
                    />
                </label>
            </div>
            <div>
                <label>
                    Nationalord:
                    <input
                        type="text"
                        value={national}
                        onChange={(e) => setNational(e.target.value)}
                        disabled={loading}
                    />
                </label>
            </div>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <div style={{ marginTop: "1em" }}>
                <button type="submit" disabled={loading}>
                    Spara
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    style={{ marginLeft: "1em" }}>
                    Avbryt
                </button>
            </div>
        </form>
    );
}
