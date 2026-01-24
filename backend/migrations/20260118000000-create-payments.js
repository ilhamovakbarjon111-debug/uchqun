export const up = async (queryInterface, Sequelize) => {
  // Create payment_type enum if it doesn't exist
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_payments_paymentType" AS ENUM('tuition', 'therapy', 'meal', 'activity', 'other');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create payment_method enum if it doesn't exist
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_payments_paymentMethod" AS ENUM('card', 'bank_transfer', 'cash', 'mobile_payment', 'online', 'other');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create payment_status enum if it doesn't exist
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_payments_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await queryInterface.createTable('payments', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    parentId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    childId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'children',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    schoolId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'schools',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: Sequelize.STRING(3),
      defaultValue: 'UZS',
      allowNull: false,
    },
    paymentType: {
      type: Sequelize.ENUM('tuition', 'therapy', 'meal', 'activity', 'other'),
      allowNull: false,
    },
    paymentMethod: {
      type: Sequelize.ENUM('card', 'bank_transfer', 'cash', 'mobile_payment', 'online', 'other'),
      allowNull: false,
    },
    paymentProvider: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    transactionId: {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    },
    status: {
      type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
      defaultValue: 'pending',
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    metadata: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    paidAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    receiptUrl: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    refundAmount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    refundedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    refundReason: {
      type: Sequelize.TEXT,
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

  // Create indexes
  await queryInterface.addIndex('payments', ['parentId']);
  await queryInterface.addIndex('payments', ['childId']);
  await queryInterface.addIndex('payments', ['schoolId']);
  await queryInterface.addIndex('payments', ['status']);
  await queryInterface.addIndex('payments', ['paymentType']);
  await queryInterface.addIndex('payments', ['transactionId']);
  await queryInterface.addIndex('payments', ['paidAt']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('payments');
  
  // Drop enums
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_paymentType";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_paymentMethod";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_status";');
};
