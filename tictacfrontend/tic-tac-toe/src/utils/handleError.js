import toast from 'react-simple-toasts';


export const handleError = (error) => {
    if (error instanceof Error) {
        console.error("An error occurred:", error.message);
        toast(error.message, { type: 'error' });
    } else if (typeof error === 'string') {
        console.error("An error occurred:", error);
        toast(error, { theme: "failure" });
    } else {
        
        console.error("An unknown error occurred:", error);
        toast("An unknown error occurred", { type: 'error' });
    }
}

export const handleInfo = (info) => {
    toast(info, { theme: 'info' });
}

export const askToast = (ask, success = () => { alert('success!') }, cancel = () => { alert('cancel') }) => {
    let isSuccessClicked = false;
    
    toast("Click to :- " + ask, {
        clickable: true,
        onClick: ()=>{isSuccessClicked = true; success();},
        onClose: ()=>{if (!isSuccessClicked) cancel()},
        duration : 10000,
        clickClosable : true
    })
}