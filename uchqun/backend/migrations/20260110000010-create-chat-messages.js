export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('chat_messages', {
    id: {
      type: Sequelize.UUID,
      // Use Sequelize UUIDV4 to avoid requiring uuid-ossp extension
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    conversationId: {
      type: Sequelize.STRING(128),
      allowNull: false,
    },
    senderId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    senderRole: {
      type: Sequelize.ENUM('parent', 'teacher'),
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    readByParent: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    readByTeacher: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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
  await queryInterface.addIndex('chat_messages', ['conversationId', 'createdAt']);
  await queryInterface.addIndex('chat_messages', ['senderId']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('chat_messages');
}

