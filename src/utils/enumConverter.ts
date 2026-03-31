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

export const GetNumberFromStatus = (status: Status): number => {
    switch (status) {
        case "pending":
            return 0;
        case "approved":
            return 1;
        case "rejected":
            return 2;
        default:
            return 0;
    }
};
