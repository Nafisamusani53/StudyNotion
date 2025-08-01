import React, { useState } from 'react'
import { deleteSection, deleteSubSection } from '../../../../services/operations/courseOperation';
import { setCourse } from '../../../../slices/courseSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RxDropdownMenu } from "react-icons/rx";
import { MdEdit, MdDelete } from "react-icons/md";
import { AiFillCaretDown } from "react-icons/ai";
import { MdAddCircleOutline } from "react-icons/md";
import ConfirmationModal from "../../../common/ConfirmationModal"
import SubSectionModal from './SubSectionModal';

const NestedView = ({ handleChangeEditSectionName }) => {

    const { course } = useSelector((state) => state.course)
    const { token } = useSelector((state) => state.auth)
    const dispatch = useDispatch();
    const [addSubSection, setAddSubsection] = useState(null)
    const [viewSubSection, setViewSubSection] = useState(null)
    const [editSubSection, setEditSubSection] = useState(null)
    const [confirmationModal, setConfirmationModal] = useState(null)

    const handleDeleleSection = async (sectionId) => {
        const data = {
            sectionId: sectionId,
            courseId: course._id
        }

        const result = await deleteSection(data, token)
        if (result) {
            dispatch(setCourse(result));
        }
        setConfirmationModal(null)
    }
    const handleDeleteSubSection = async (subSectionId, sectionId) => {
        const data = {
            subSectionId : subSectionId,
            sectionId : sectionId
        }
        const result = await deleteSubSection(data, token)
        if (result) {
            // update the structure of course
            const updatedCourseContent = course.courseContent.map((section) =>
                section._id === sectionId ? result : section
            )
            const updatedCourse = { ...course, courseContent: updatedCourseContent }
            dispatch(setCourse(updatedCourse))
        }
        setConfirmationModal(null)
    }


    return (
        <>
            <div className='flex flex-col px-4 py-4 mt-6 gap-2 bg-richblack-700 rounded-md text-richblack-5'>
                {
                    course?.courseContent?.map((section) => (
                        <details key={section._id} className='w-full'>
                            <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
                                <div className="flex items-center gap-x-3">
                                    <RxDropdownMenu className="text-2xl text-richblack-50" />
                                    <p className="font-semibold text-richblack-50">
                                        {section.sectionName}
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-3">
                                    <button
                                        onClick={() =>
                                            handleChangeEditSectionName(
                                                section._id,
                                                section.sectionName
                                            )
                                        }
                                    >
                                        <MdEdit className="text-xl text-richblack-300" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setConfirmationModal({
                                                text1: "Delete this Section?",
                                                text2: "All the lectures in this section will be deleted",
                                                btn1Text: "Delete",
                                                btn2Text: "Cancel",
                                                btn1Handler: () => {
                                                    handleDeleleSection(section._id)
                                                },
                                                btn2Handler: () => setConfirmationModal(null),
                                            })
                                        }
                                    >
                                        <MdDelete className="text-xl text-richblack-300" />
                                    </button>
                                    <span className="font-medium text-richblack-300">|</span>
                                    <AiFillCaretDown className={`text-xl text-richblack-300`} />
                                </div>
                            </summary>
                            <div className="px-6 pb-4">
                                {section?.subSection?.map((data) => (
                                    <div
                                        key={data?._id}
                                        onClick={() => setViewSubSection(data)}
                                        className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2"
                                    >
                                        <div className="flex items-center gap-x-3 py-2 ">
                                            <RxDropdownMenu className="text-2xl text-richblack-50" />
                                            <p className="font-semibold text-richblack-50">
                                                {data.title}
                                            </p>
                                        </div>
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-x-3"
                                        >
                                            <button
                                                onClick={() =>
                                                    setEditSubSection({ ...data, sectionId: section._id })
                                                }
                                            >
                                                <MdEdit className="text-xl text-richblack-300" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setConfirmationModal({
                                                        text1: "Delete this Sub-Section?",
                                                        text2: "This lecture will be deleted",
                                                        btn1Text: "Delete",
                                                        btn2Text: "Cancel",
                                                        btn1Handler: () =>
                                                            handleDeleteSubSection(data._id, section._id),
                                                        btn2Handler: () => setConfirmationModal(null),
                                                    })
                                                }
                                            >
                                                <MdDelete className="text-xl text-richblack-300" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* Add New Lecture to Section */}
                                <button
                                    onClick={() => setAddSubsection(section._id)}
                                    className="mt-3 flex items-center gap-x-1 text-yellow-50"
                                >
                                    <MdAddCircleOutline className="text-lg" />
                                    <p>Add Lecture</p>
                                </button>
                            </div>

                        </details>
                    ))
                }
            </div>

            {addSubSection ? (
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubsection}
          add={true}
        />
      ) : viewSubSection ? (
        <SubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      ) : editSubSection ? (
        <SubSectionModal
          modalData={editSubSection}
          setModalData={setEditSubSection}
          edit={true}
        />
      ) : (
        <></>
      )}
      {/* Confirmation Modal */}
      {confirmationModal ? (
        <ConfirmationModal modalData={confirmationModal} />
      ) : (
        <></>
      )}
        </>
    )
}

export default NestedView
