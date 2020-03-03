import React, { useState } from "react";
import { Row, Col, Form, Button, Modal, Spinner } from "react-bootstrap";
import { debounce, upperFirst } from "lodash";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { courses, includedDates } from "../constants/defaultData";

const SignupForm = () => {
  const initialState = {
    courses: courses,
    formData: {
      course: "",
      subject: "",
      note: "",
      startdate: ""
    },
    messageModal: false,
    errors: {},
    loading: false
  };

  const [state, setState] = useState(initialState);

  // handle data changes
  const handleChange = e => {
    const { name, value } = e.target;

    setState({
      ...state,
      formData: {
        ...state.formData,
        [name]: value
      },
      errors: handleError(name)
    });
  };

  const handleDate = date => {
    setState({
      ...state,
      formData: {
        ...state.formData,
        startdate: date
      },
      errors: handleError("startdate")
    });
  };

  const handleError = field => {
    let errorData = { ...state.errors };
    delete errorData[field];
    return errorData;
  };

  // handle (hide/show) success message modal and close it with data reset
  const handleMessageModal = type => {
    if (type && type === "ok") {
      setState({
        ...state,
        messageModal: !state.messageModal,
        errors: {},
        formData: {
          course: "",
          subject: "",
          note: "",
          startdate: ""
        }
      });
    } else {
      setState({
        ...state,
        messageModal: !state.messageModal
      });
    }
  };

  // validate data on submit
  const isValidData = () => {
    let isValid = true;
    let invalidData = {};

    Object.keys(state.formData).map(field => {
      if (
        (state.formData[field] === "" || state.formData[field] === null) &&
        field !== "note"
      ) {
        // check for the required fields
        isValid = false;
        invalidData[field] = upperFirst(`${upperFirst(field)} is required.`);
      } else if (
        field === "note" &&
        state.formData[field] !== "" &&
        (state.formData[field].length < 20 ||
          state.formData[field].length > 500)
      ) {
        // check for the note length
        isValid = false;
        invalidData[field] = `${upperFirst(
          field
        )} must be more than 20 characters and less than 500 characters long.`;
      } else if (field === "startdate" && state.formData[field] !== "") {
        // check for the dates selected
        let dateStringData = state.formData[field].toDateString();
        if (!includedDates.includes(dateStringData)) {
          isValid = false;
          invalidData[field] =
            "Your selected course and subject is not offered beginning from your selected date.";
        }
      }
    });

    setState({
      ...state,
      errors: invalidData
    });

    return isValid;
  };

  // delay the process of form submission using debounce
  const debounceSuccess = debounce(() => {
    handleMessageModal("ok");
  }, 1500);

  // submit the form on valid data with delay to show spinner
  const submitForm = () => {
    if (isValidData()) {
      setState({
        ...state,
        loading: true
      });
      debounceSuccess();
    }
  };

  return (
    <>
      <Form className="form-width">
        {/* Course radio buttons */}
        <Form.Group as={Row}>
          <Form.Label column sm={3}>
            Course
            <span className="text-danger mx-1">*</span>
          </Form.Label>

          <Col sm={9}>
            {Object.keys(state.courses).map(eachCourse => (
              <Form.Check
                key={`radio-${eachCourse}`}
                type="radio"
                label={state.courses[eachCourse].label}
                name="course"
                onChange={handleChange}
                value={eachCourse}
                checked={state.formData.course === eachCourse ? true : false}
                id={`radio-${eachCourse}`}
              />
            ))}
            {state.errors.course && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {state.errors.course}
              </Form.Control.Feedback>
            )}
          </Col>
        </Form.Group>

        {/* Subject dropdown */}
        <Form.Group as={Row}>
          <Form.Label column sm={3}>
            Subject
            <span className="text-danger mx-1">*</span>
          </Form.Label>
          <Col sm={9}>
            <Form.Control
              as="select"
              name="subject"
              value={state.formData.subject}
              onChange={handleChange}
            >
              <option value="">Select subject</option>
              {state.formData.course &&
                state.courses[state.formData.course].subjects.map(
                  (eachSubject, index) => (
                    <option key={`option-${index}`} value={eachSubject}>
                      {eachSubject}
                    </option>
                  )
                )}
            </Form.Control>
            {state.errors.subject && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {state.errors.subject}
              </Form.Control.Feedback>
            )}
          </Col>
        </Form.Group>

        {/* Datepicker for the start date */}
        <Form.Group as={Row}>
          <Form.Label column sm={3}>
            Start date
            <span className="text-danger mx-1">*</span>
          </Form.Label>
          <Col sm={9}>
            <DatePicker
              name="startdate"
              placeholderText="Click to select a date"
              className="form-control"
              selected={state.formData.startdate}
              onChange={date => handleDate(date)}
              dateFormat="dd MMMM, yyyy"
            />
            {state.errors.startdate && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {state.errors.startdate}
              </Form.Control.Feedback>
            )}
          </Col>
        </Form.Group>

        {/* Additional note textarea */}
        <Form.Group as={Row}>
          <Form.Label column sm={3}>
            Additional Notes
          </Form.Label>
          <Col sm={9}>
            <Form.Control
              as="textarea"
              name="note"
              value={state.formData.note}
              onChange={handleChange}
            />
            {state.errors.note && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {state.errors.note}
              </Form.Control.Feedback>
            )}
          </Col>
        </Form.Group>

        {/* Submit button with spinner */}
        <Form.Group as={Row}>
          <Col sm={12} colSpan={2} className="text-center">
            <Button type="button" onClick={submitForm} disabled={state.loading}>
              {state.loading && (
                <Spinner animation="border" size="sm" className="mx-1" />
              )}
              Submit
            </Button>
          </Col>
        </Form.Group>
      </Form>

      {/* Popup for successful submission */}
      <Modal
        show={state.messageModal}
        onHide={handleMessageModal}
        size="md"
        centered
      >
        <Modal.Header closeButton className="py-2 px-3">
          <Modal.Title>Success!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Your course has been successfully registered.</p>
          <Button
            onClick={handleMessageModal}
            size="sm"
            variant="success"
            className="my-2"
          >
            Ok
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SignupForm;
