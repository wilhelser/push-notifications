# frozen_string_literal: true

class User < ApplicationRecord
  attr_accessor :pin_0, :pin_1, :pin_2, :pin_3

  enum role: { user: 0, admin: 1 }

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable

  after_create_commit lambda {
                        broadcast_prepend_to "users", partial: "admin/users/user", locals: { user: self },
                                                      target: "users"
                      }
  after_create :update_user_verified_column_to_true
  # after_create :send_pin!

  def update_user_verified_column_to_true
    UpdateUserJob.perform_now(self)
  end

  def reset_pin!
    update_column(:pin, rand(1000..9999))
  end

  def unverify!
    update_column(:verified, false)
  end

  def send_pin!
    reset_pin!
    unverify!
    SendPinJob.perform_now(self)
  end
end
