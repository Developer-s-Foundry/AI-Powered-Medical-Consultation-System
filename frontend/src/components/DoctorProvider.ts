import React, { createContext, useContext, useState } from "react";

interface Doctor {
        doctor_id: string,
        first_name: string,
        last_name: string,
        specialty: string,
        fee: number,
}


interface DoctorContextType {
  doctor: Doctor | null;
  setDoctor: (doctor: Doctor | null) => void;
}

// Create the context
export const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const useDoctorContext = () => {
  const context = useContext(DoctorContext);
  if (context === undefined) {
    throw new Error("useDoctorContext must be used within a DoctorProvider");
  }
  return context;
};

export const DoctorProvider = ({ children }: { children: React.ReactNode }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  return React.createElement(
    DoctorContext.Provider,
    { value: { doctor, setDoctor } },
    children
  );
};