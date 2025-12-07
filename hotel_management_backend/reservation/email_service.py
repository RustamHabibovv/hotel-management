"""
Email service for sending reservation notifications using SendGrid
"""
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from datetime import timedelta


def send_reservation_email(reservation, email_type='created'):
    """
    Send email notification for reservation events.
    
    Args:
        reservation: Reservation object
        email_type: 'created', 'modified', or 'cancelled'
    """
    # Get SendGrid configuration from environment
    api_key = os.getenv('SENDGRID_API_KEY')
    from_email = os.getenv('SENDGRID_FROM_EMAIL')
    from_name = os.getenv('SENDGRID_FROM_NAME', 'Hotel Management')
    
    if not api_key or not from_email:
        print("⚠️ SendGrid not configured. Skipping email.")
        return False
    
    # Get reservation details
    guest_email = reservation.user.email_address
    guest_name = f"{reservation.user.name} {reservation.user.surname}".strip()
    check_in = reservation.date
    check_out = reservation.date + timedelta(days=int(reservation.duration))
    
    # Get room details
    from room.models import ReservationRoom
    reservation_room = ReservationRoom.objects.filter(reservation=reservation).first()
    room_number = reservation_room.room.number if reservation_room else "N/A"
    
    # Build email content based on type
    if email_type == 'created':
        subject = f"🎉 Reservation Confirmed - Room {room_number}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #4a90e2;">Reservation Confirmed!</h2>
                    <p>Dear {guest_name},</p>
                    <p>Thank you for your reservation. We're excited to host you!</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Reservation Details:</h3>
                        <p><strong>Room Number:</strong> {room_number}</p>
                        <p><strong>Check-in:</strong> {check_in.strftime('%B %d, %Y')}</p>
                        <p><strong>Check-out:</strong> {check_out.strftime('%B %d, %Y')}</p>
                        <p><strong>Number of Guests:</strong> {reservation.number_of_guests}</p>
                        <p><strong>Number of Nights:</strong> {int(reservation.duration)}</p>
                        <p><strong>Total Price:</strong> ${abs(reservation.price):.2f}</p>
                    </div>
                    
                    <p>If you have any questions, feel free to contact us.</p>
                    <p style="margin-top: 30px;">Best regards,<br>{from_name}</p>
                </div>
            </body>
        </html>
        """
    
    elif email_type == 'modified':
        subject = f"✏️ Reservation Modified - Room {room_number}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #f39c12;">Reservation Modified</h2>
                    <p>Dear {guest_name},</p>
                    <p>Your reservation has been successfully modified.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Updated Reservation Details:</h3>
                        <p><strong>Room Number:</strong> {room_number}</p>
                        <p><strong>Check-in:</strong> {check_in.strftime('%B %d, %Y')}</p>
                        <p><strong>Check-out:</strong> {check_out.strftime('%B %d, %Y')}</p>
                        <p><strong>Number of Guests:</strong> {reservation.number_of_guests}</p>
                        <p><strong>Number of Nights:</strong> {int(reservation.duration)}</p>
                        <p><strong>Total Price:</strong> ${abs(reservation.price):.2f}</p>
                    </div>
                    
                    <p>If you have any questions, feel free to contact us.</p>
                    <p style="margin-top: 30px;">Best regards,<br>{from_name}</p>
                </div>
            </body>
        </html>
        """
    
    elif email_type == 'cancelled':
        subject = f"❌ Reservation Cancelled - Room {room_number}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #e74c3c;">Reservation Cancelled</h2>
                    <p>Dear {guest_name},</p>
                    <p>Your reservation has been cancelled as requested.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Cancelled Reservation Details:</h3>
                        <p><strong>Room Number:</strong> {room_number}</p>
                        <p><strong>Check-in Date:</strong> {check_in.strftime('%B %d, %Y')}</p>
                        <p><strong>Check-out Date:</strong> {check_out.strftime('%B %d, %Y')}</p>
                    </div>
                    
                    <p>We hope to see you again in the future!</p>
                    <p style="margin-top: 30px;">Best regards,<br>{from_name}</p>
                </div>
            </body>
        </html>
        """
    else:
        return False
    
    # Create and send email
    try:
        message = Mail(
            from_email=(from_email, from_name),
            to_emails=guest_email,
            subject=subject,
            html_content=html_content
        )
        
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        
        print(f"✅ Email sent successfully to {guest_email}")
        print(f"   Status Code: {response.status_code}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return False
