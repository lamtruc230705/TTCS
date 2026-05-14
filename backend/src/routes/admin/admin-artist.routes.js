const express = require('express');
const controller = require('../../controllers/admin/admin-artist.controller');
const validate = require('../../middlewares/validate.middleware');
const { artistSchema, artistUpdateSchema, scheduleSchema } = require('../../validations/artist.validation');

const router = express.Router();

router.get('/', controller.getArtists);
router.post('/', validate(artistSchema), controller.createArtist);
router.get('/profile-requests', controller.getProfileRequests);
router.post('/profile-requests/:id/approve', controller.approveProfileRequest);
router.post('/profile-requests/:id/reject', controller.rejectProfileRequest);
router.get('/:id', controller.getArtistDetail);
router.put('/:id', validate(artistUpdateSchema), controller.updateArtist);
router.delete('/:id', controller.deleteArtist);
router.get('/:artistId/schedules', controller.getSchedules);
router.post('/:artistId/schedules', validate(scheduleSchema), controller.createSchedule);

module.exports = router;
