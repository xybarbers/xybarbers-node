import calculateDistance from '../utils/calculateDistance';
import User from '../models/User';
import File from '../models/File';
import Location from '../models/Location';

class SearchController {
  async index(req, res) {
    const user = await User.findByPk(req.userId, {
      attributes: {
        exclude: [
          'password_hash',
          'password_reset_token',
          'password_reset_expires',
        ],
      },
      include: [
        {
          model: Location,
          as: 'point',
          attributes: ['longitude', 'latitude'],
        },
      ],
    });
    if (!user) {
      return res.status(400).json({ error: 'Not was able to find the user.' });
    }
    if (user.provider) {
      return res
        .status(400)
        .json({ error: 'Providers users not able to find other providers.' });
    }
    const providers = await User.findAll({
      where: {
        provider: true,
        provider_validate: true,
      },
      attributes: {
        exclude: [
          'password_hash',
          'password_reset_token',
          'password_reset_expires',
        ],
      },
      include: [
        {
          model: Location,
          as: 'point',
          attributes: ['id', 'longitude', 'latitude'],
        },
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    const filteredProviders = providers.filter(provider => {
      return calculateDistance(user.point, provider.point) < 10;
    });
    return res.json(filteredProviders);
  }
}
export default new SearchController();
