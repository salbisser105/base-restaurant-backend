const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const storage = require('../utils/cloud_storage');
const Rol = require('../models/rol');
const {
    updateWithoutImage
} = require('../models/user');
module.exports = {

    login(req, res) {
        const email = req.body.email;
        const pw = req.body.password;

        User.findByEmail(email, async (err, myUser) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuario',
                    error: err
                })
            }
            if (!myUser) {
                return res.status(401).json({ //Cliente sin autorización para la petición
                    success: false,
                    message: 'El email no fue encontrado',
                    error: err
                })
            }
            const isPasswordValid = await bcrypt.compare(pw, myUser.password);

            if (isPasswordValid) {
                const token = jwt.sign({
                    id: myUser.id,
                    email: myUser.email
                }, keys.secretOrKey, {
                    // expiresIn
                });
                const data = {
                    id: `${myUser.id}`,
                    name: myUser.name,
                    lastname: myUser.lastname,
                    email: myUser.email,
                    phone: myUser.phone,
                    image: myUser.image,
                    session_token: `JWT ${token}`,
                    roles: JSON.parse(myUser.roles)
                }
                return res.status(201).json({
                    success: true,
                    message: 'El usuario se autentico correctamente',
                    data: data // Id del usuario que se registro.
                });
            } else {
                return res.status(401).json({ //Cliente sin autorización para la petición
                    success: false,
                    message: 'Contraseña incorrecta',
                    error: err
                });
            }


        });

    },

    register(req, res) {
        const user = req.body; // Capturo datos que envia el cliente.
        User.create(user, (err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuario',
                    error: err
                })
            }
            return res.status(201).json({
                success: true,
                message: 'El registro se realizo correctamente',
                data: data // Id del usuario que se registro.
            })
        });

    },
    async registerWithImage(req, res) {
        const user = JSON.parse(req.body.user); // Capturo datos que envia el cliente.

        const files = req.files;
        if (files.length > 0) {
            const path = `image_${Date.now}`;
            const url = await storage(files[0], path);
            if (url != undefined && url != null) {
                user.image = url;
            }
        }

        User.create(user, (err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuario',
                    error: err
                })
            }

            user.id = `${data}`;
            const token = jwt.sign({
                id: user.id,
                email: user.email
            }, keys.secretOrKey, {
                // expiresIn
            });

            user.session_token = `JWT ${token}`;
            Rol.create(user.id, 3, (err, data) => {
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con el registro del rol del usuario',
                        error: err
                    });
                } else {
                    return res.status(201).json({
                        success: true,
                        message: 'El registro se realizo correctamente',
                        data: user
                    });
                }
            });

        });

    },

    async updateWithImage(req, res) {
        const user = JSON.parse(req.body.user); // Capturo datos que envia el cliente.

        const files = req.files;
        if (files.length > 0) {
            const path = `image_${Date.now}`;
            const url = await storage(files[0], path);
            if (url != undefined && url != null) {
                user.image = url;
            }
        }

        User.updateWithImage(user, (err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con la actualización del usuario',
                    error: err
                })
            }

            User.findById(data, (err, myData) => {

                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con la actualización del usuario',
                        error: err
                    })
                }

                myData.session_token = user.session_token;
                myData.roles = JSON.parse(myData.roles);
                return res.status(201).json({
                    success: true,
                    message: 'El usuario se realizo correctamente',
                    data: myData
                });
            })


        });

    },
    async updateWithoutImage(req, res) {
        const user = req.body; // Capturo datos que envia el cliente.
        User.updateWithoutImage(user, (err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con la actualización del usuario',
                    error: err
                })
            }

            User.findById(data, (err, myDataU) => {
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con la actualización del usuario',
                        error: err
                    })
                }
                myDataU.session_token = user.session_token;
                myDataU.roles = JSON.parse(myDataU.roles);

                return res.status(201).json({
                    success: true,
                    message: 'El usuario se realizo correctamente',
                    data: myDataU
                });
            })

        });

    }

}