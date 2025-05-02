import User from './User.js';
import Violation from './Violation.js';

User.hasMany(Violation, { foreignKey: 'userId' });
Violation.belongsTo(User, { foreignKey: 'userId' });

export { User, Violation };