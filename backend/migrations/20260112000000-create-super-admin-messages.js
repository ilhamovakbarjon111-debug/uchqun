export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('super_admin_messages', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    senderId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    subject: {
      type: Sequelize.STRING(500),
      allowNull: false,
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    isRead: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    readAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    reply: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    repliedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
  });

  await queryInterface.addIndex('super_admin_messages', ['senderId']);
  await queryInterface.addIndex('super_admin_messages', ['isRead']);
  await queryInterface.addIndex('super_admin_messages', ['createdAt']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('super_admin_messages');
}
