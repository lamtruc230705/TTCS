const express = require('express');
const controller = require('../../controllers/admin/admin-schedule.controller');
const validate = require('../../middlewares/validate.middleware');
const { scheduleSchema } = require('../../validations/artist.validation');

const router = express.Router();

router.put('/:scheduleId', validate(scheduleSchema), controller.updateSchedule);
router.delete('/:scheduleId', controller.deleteSchedule);

module.exports = router;
