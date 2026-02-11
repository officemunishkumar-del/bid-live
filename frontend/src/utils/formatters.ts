export const formatCurrency = (amount: number, currency: string = "$") => {
    return `${currency}${amount.toLocaleString()}`;
};

export const getTimeRemaining = (endTime: string) => {
    const total = new Date(endTime).getTime() - Date.now();
    if (total <= 0) return {
        total: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        label: "Ended",
        urgency: "ended" as const
    };

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / (1000 * 60)) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    let label = "";
    let urgency: "normal" | "warning" | "urgent" | "ended" = "normal";

    if (days > 0) {
        label = `${days} Days ${hours} Hrs ${minutes} Min ${seconds} Sec`;
    } else if (hours > 0) {
        label = `${hours} Hrs ${minutes} Min ${seconds} Sec`;
        urgency = "warning";
    } else {
        label = minutes > 0 ? `${minutes} Min ${seconds} Sec` : `${seconds} Sec`;
        urgency = "urgent";
    }

    return { total, days, hours, minutes, seconds, label, urgency };
};
