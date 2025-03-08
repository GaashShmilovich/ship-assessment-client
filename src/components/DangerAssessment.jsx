// src/components/DangerAssessment.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchDangerAssessments } from "../services/mockApi";

const DangerAssessment = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDangerAssessments()
      .then((response) => {
        const found = response.data.find((item) => item.id.toString() === id);
        setAssessment(found);
      })
      .catch((err) => {
        console.error("Error fetching assessments:", err);
        setError("Could not load assessment.");
      });
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!assessment) return <div>Loading...</div>;

  return (
    <div>
      <h1>Danger Assessment Detail</h1>
      <p>ID: {assessment.id}</p>
      <p>Status: {assessment.status}</p>
      <p>Details: {assessment.details}</p>
    </div>
  );
};

export default DangerAssessment;
