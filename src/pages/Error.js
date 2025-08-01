import backgroundImage from '../assests/404.png';
import CtnButton from '../components/core/HomePage/CtnButton';

const Error = () => {
  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center text-center text-white"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="p-5 rounded-lg md:p-20 md:w-auto w-11/12">
        <p className="text-white text-2xl md:text-4xl my-2">Oops! It looks like you're lost.</p>
          <div className="mt-8 flex justify-center gap-7">
          <CtnButton active={true} linkto={"/"}>
          Go to Homepage
          </CtnButton>
        </div>
      </div>
    </div>
  )
}

export default Error