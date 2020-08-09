import React from "react";
import PrivateLayout from "@layouts/privateLayout";
import TareasTable from "@components/tareas/tareasTable";

const TareasContainer = () => {
  return (
    <PrivateLayout>
      <main className="container-fluid">
        <h1 className="text-center display-4">Tareas</h1>
        <div className="row justify-content-center">
          <div className="col-lg-8 align-self-center ">
            <TareasTable />
          </div>
        </div>
      </main>
    </PrivateLayout>
  );
};

export default TareasContainer;