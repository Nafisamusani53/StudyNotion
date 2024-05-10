import { apiConnector } from '../apiConnector'
import toast from 'react-hot-toast'
import { setLoading, setToken } from '../../slices/authSlice'
import { contactUs } from '../apis'


export const contactUsEmail = (data) => {
    return async(dispatch) => {
        dispatch(setLoading(true))
        const toastId = toast.loading("Loading...")
        try{console.log("data", data)
            console.log("start")
            const result = await apiConnector("POST" , contactUs.CONTACT_US_API, data)
            console.log(result)

            if(!result.data.success){
                throw new Error(result.data.message);
            }

            toast.success("Email Sent Successfully")


        }
        catch(error){
            toast.error("Email not sent")
            console.log("Email not sent")
            // console.error(error.message)
        }
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
    
}