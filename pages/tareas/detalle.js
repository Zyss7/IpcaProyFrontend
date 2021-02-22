import LoadingWrapper from '@components/Loadings/LoadingWrapper';
import styled from '@emotion/styled';
import PrivateLayout from '@layouts/privateLayout';
import { Comentario } from '@services/Comentarios.service';
import classnames from 'classnames';
import useTareas from 'hooks/useTareas';
import useUsuario from 'hooks/useUsuario';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const DetalleTareaContainer = ({ id }) => {
  const [tarea, setTarea] = useState({});
  const [loading, setLoading] = useState(true);
  const { usuario } = useUsuario();
  const [showDescripcion, setShowDescripcion] = useState(true);
  const [comentarios, setComentarios] = useState([]);

  const { register, errors, handleSubmit, reset } = useForm({
    mode: 'onChange',
  });

  const { getTareaById, changeEstado } = useTareas();

  useEffect(() => {
    setLoading(true);
    getTareaById(id).then((res) => {
      setTarea(res);
      setLoading(false);
    });

    Comentario.getAll(id, (payload) => {
      const newPayload = _.orderBy(
        payload.map((c) => ({
          ...c,
          fecha: moment(c.createdAt).fromNow(),
        })),
        ['createdAt'],
        ['desc'],
      );
      setComentarios(newPayload);
    });
  }, []);

  const addComentario = async (data) => {
    await Comentario.addComentario({
      room: 'comentariosTareas',
      uuid: id,
      usuario: {
        idDocente: usuario.isDocente,
        isAlumno: usuario.isAlumno,
        rol: usuario.rol,
        str: usuario.persona.str,
        id: usuario.persona.identificacion,
      },
      createdAt: moment().toISOString(),
      mensaje: data.mensaje,
    });

    reset();
  };

  const deleteComentario = (idDoc) => async () => {
    await Comentario.delete(idDoc);
  };

  const onChangeEstado = async ({ target }) => {
    await changeEstado(id, tarea, target.value);
  };

  return (
    <PrivateLayout>
      <LoadingWrapper loading={loading}>
        <div className="container-fluid mb-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-11 col-xl-10">
              <div className="row justify-content-center">
                <div className="col-12 text-center mt-2">
                  <h1>Tarea: {tarea.titulo}</h1>
                </div>

                <div className="col-12">
                  <h4>Alumnos:</h4>
                  <ol>
                    {tarea?.alumnos?.map((alumno, index) => (
                      <li key={index}>{alumno.str}</li>
                    ))}
                  </ol>
                  {usuario?.isDocente && (
                    <h4 className="my-3">Estado: {tarea.estadoEnvio}</h4>
                  )}

                  {usuario?.isAlumno && (
                    <React.Fragment>
                      <div className="d-inline-flex">
                        <h4 className="my-3">Estado: </h4>
                        <select
                          className="form-control my-3 ml-1"
                          defaultValue={tarea?.estado}
                          onChange={onChangeEstado}
                        >
                          <option value="PENDIENTE">PENDIENTE</option>
                          <option value="FINALIZADO">FINALIZADO</option>
                        </select>
                      </div>
                    </React.Fragment>
                  )}
                </div>
                <div className="col-12">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowDescripcion(!showDescripcion)}
                  >
                    {showDescripcion && 'Ocultar descripcion'}
                    {!showDescripcion && 'Ver descripcion'}
                  </button>
                </div>
                {showDescripcion && (
                  <div className="col-12 border border-secondary">
                    <DescripcionViewer
                      dangerouslySetInnerHTML={{ __html: tarea.descripcion }}
                    />
                  </div>
                )}
              </div>

              <div className="row justify-content-center mt-3">
                <div className="col-12">
                  <h3>Comentarios:</h3>
                </div>

                <div className="col-12 col-md-11">
                  <form onSubmit={handleSubmit(addComentario)}>
                    <Form.Control
                      as="textarea"
                      name="mensaje"
                      isInvalid={!!errors?.mensaje?.message}
                      ref={register({
                        validate: (value) => {
                          if (value.trim() === '') {
                            return 'Ingrese un mensaje';
                          }
                        },
                      })}
                    />
                    <div className="text-right mb-2">
                      <button className="btn btn-primary btn-sm" type="submit">
                        Enviar
                      </button>
                    </div>
                  </form>
                  <ul className="list-group">
                    {comentarios.map((comentario, index) => (
                      <li
                        className={classnames({
                          'list-group-item': true,
                          'text-right':
                            comentario?.usuario?.id === usuario?.persona?.identificacion,
                        })}
                        key={comentario.id}
                      >
                        <UsuarioMsg>
                          {comentario?.usuario?.str}
                          <span className="text-info ml-1">
                            ({comentario.usuario.rol})
                          </span>
                          {comentario?.usuario?.id ===
                            usuario?.persona?.identificacion && (
                            <BtnEliminarMsg
                              className="btn text-danger"
                              onClick={deleteComentario(comentario.id)}
                            >
                              Eliminar
                            </BtnEliminarMsg>
                          )}
                        </UsuarioMsg>
                        <br />
                        {comentario?.mensaje}
                        <br />
                        <FechaHace>{comentario?.fecha}</FechaHace>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LoadingWrapper>
    </PrivateLayout>
  );
};

DetalleTareaContainer.getInitialProps = ({ query }) => query;

export default DetalleTareaContainer;

const FechaHace = styled.strong`
  font-weight: bold;
  font-size: 12px;
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
`;
const UsuarioMsg = styled.strong`
  font-weight: bold;
  font-size: 15px;
`;

const BtnEliminarMsg = styled.button`
  font-size: 10px;
  text-decoration: underline;
`;

const DescripcionViewer = styled.div`
  padding-top: 1rem;
  padding-bottom: 1rem;
  table {
    border: 1px solid black;
  }
  tr {
    border: 1px solid black;
  }
  td {
    padding: 0.5rem;
    border: 1px solid black;
  }
`;
