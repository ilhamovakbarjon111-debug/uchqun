/**
 * Migration: Add telegramUsername column to admin_registration_requests table
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('admin_registration_requests', 'telegramUsername', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '',
    comment: 'Telegram username (without @) - required field',
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('admin_registration_requests', 'telegramUsername');
}
