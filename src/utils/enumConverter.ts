import { Status } from "@/types/status";

export const GetStatusFromNumber = (statusIndex: number | null): Status => {
    switch (statusIndex) {
        case 0:
            return "pending";
        case 1:
            return "approved";
        case 2:
            return "rejected";
        default:
            return "pending";
    }
};
