import { useState } from "react";
import { UpdateDialectword } from "@/actions/dialectwords";

interface EditWordFormProps {
    id: number | string;
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
            const parsedId = Number(id);
            if (Number.isNaN(parsedId)) {
                throw new Error("Ogiltigt id för ordet.");
            }

            await UpdateDialectword({
                id: parsedId,
                word: dialekt,
                nationalWord: national,
            });

            if (onUpdated) {
                onUpdated();
            }
            onClose();
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Något gick fel.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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
