import React from 'react';
import { useField } from 'formik';

const MyTextInput = ({ label, ...props }) => {
    // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
    // which we can spread on <input>. We can use field meta to show an error
    // message if the field is invalid and it has been touched (i.e. visited)
    const [field, meta] = useField(props);
    return (
      <div className="form-group mb-4">
        <label htmlFor={props.id || props.name} style={{cursor: "pointer"}}>{label}</label>
        {props.id === "classCode" && <span style={{display: "block", marginBottom: "15px"}}>Ask your teacher for the class code, then enter it here.</span>}
        <input className="form-control" {...field} {...props} />
        {meta.touched && meta.error ? (
          <div className="text-danger">{meta.error}</div>
        ) : null}
      </div>
    );
};

export default MyTextInput;