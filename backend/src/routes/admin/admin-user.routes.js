const express = require('express');
const controller = require('../../controllers/admin/admin-user.controller');
const validate = require('../../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema } = require('../../validations/user.validation');

const router = express.Router();

router.get('/', controller.getUsers);
router.post('/', validate(createUserSchema), controller.createUser);
router.get('/:id', controller.getUserDetail);
router.put('/:id', validate(updateUserSchema), controller.updateUser);
router.delete('/:id', controller.deleteUser);
router.patch('/:id/role', controller.changeRole);

module.exports = router;
