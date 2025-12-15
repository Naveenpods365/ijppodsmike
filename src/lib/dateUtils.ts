import moment from "moment";

export const formatNextRunTime = (isoString) => {
    if (!isoString) return "";

    const date = moment.parseZone(isoString);
    const now = moment();

    const isToday = date.isSame(now, 'day');
    const isTomorrow = date.isSame(now.clone().add(1, 'days'), 'day');

    const timeFormat = "hh:mm A";

    if (isToday) {
        return `Today at ${date.format(timeFormat)}`;
    } else if (isTomorrow) {
        return `Tomorrow at ${date.format(timeFormat)}`;
    } else {
        // e.g. 26 dec at 8:00 AM
        return `${date.format("D MMM")} at ${date.format(timeFormat)}`;
    }
};
