import toast from 'react-simple-toasts';


export const handleError = (error) => {
    if (error instanceof Error) {
        console.error("An error occurred:", error.message);
        toast(error.message, { type: 'error' });
    } else if (typeof error === 'string') {
        console.error("An error occurred:", error);
        toast(error, { type: 'error' });
    } else {
        console.error("An unknown error occurred:", error);
        toast("An unknown error occurred", { type: 'error' });
    }
}