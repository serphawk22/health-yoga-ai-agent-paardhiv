// Appointments Page
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getDoctors,
  getDoctorAvailability,
  extractAppointmentFromText,
  createAppointment,
  getUserAppointments,
  cancelAppointment
} from '@/lib/actions/appointments';
import { formatDate, formatTime } from '@/lib/utils';
import {
  Calendar,
  Clock,
  User,
  Star,
  MessageCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Phone,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { DoctorPatientChat } from '@/components/chat/DoctorPatientChat';
import { getUser } from '@/lib/actions/auth';

export default function AppointmentsPage() {
  const [view, setView] = useState<'list' | 'book'>('list');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [category, setCategory] = useState<'all' | 'doctors' | 'instructors'>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nlInput, setNlInput] = useState('');
  const [nlExtraction, setNlExtraction] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [reason, setReason] = useState('');

  // Chat state
  const [activeChat, setActiveChat] = useState<any>(null); // { id, name }
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    getUser().then(user => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const loadAvailability = useCallback(async () => {
    if (!selectedDoctor) return;
    setIsLoading(true);
    const result = await getDoctorAvailability(
      selectedDoctor.id,
      format(selectedDate, 'yyyy-MM-dd')
    );
    if (result.success) {
      setAvailableSlots(result.data?.slots || []);
    }
    setIsLoading(false);
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailability();
    }
  }, [selectedDoctor, selectedDate, loadAvailability]);

  async function loadData() {
    const [doctorsResult, appointmentsResult] = await Promise.all([
      getDoctors(),
      getUserAppointments(),
    ]);

    if (doctorsResult.success) setDoctors(doctorsResult.data || []);
    if (appointmentsResult.success) setAppointments(appointmentsResult.data || []);
  }

  async function handleNLExtraction() {
    if (!nlInput.trim()) return;
    setIsExtracting(true);
    const result = await extractAppointmentFromText(nlInput);
    if (result.success) {
      setNlExtraction(result.data);
      if (result.data.doctor) {
        setSelectedDoctor(result.data.doctor);
      }
      if (result.data.date) {
        setSelectedDate(new Date(result.data.date));
      }
      if (result.data.time) {
        setSelectedTime(result.data.time);
      }
    }
    setIsExtracting(false);
  }

  async function handleBookAppointment() {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('doctorId', selectedDoctor.id);
    formData.append('scheduledDate', format(selectedDate, 'yyyy-MM-dd'));
    formData.append('scheduledTime', selectedTime);
    formData.append('reason', reason);
    if (nlInput) {
      formData.append('originalQuery', nlInput);
      formData.append('extractedIntent', nlExtraction?.intent || '');
    }

    const result = await createAppointment(formData);

    if (result.success) {
      setBookingSuccess(true);
      loadData();
      setTimeout(() => {
        setView('list');
        setBookingSuccess(false);
        setSelectedDoctor(null);
        setSelectedTime(null);
        setNlInput('');
        setNlExtraction(null);
        setReason('');
      }, 2000);
    }
    setIsLoading(false);
  }

  async function handleCancelAppointment(appointmentId: string) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    await cancelAppointment(appointmentId);
    loadData();
  }

  // Generate week days
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter doctors based on category
  const filteredDoctors = doctors.filter(doc => {
    if (category === 'all') return true;
    if (category === 'doctors') return doc.specialization !== 'Yoga Instructor';
    if (category === 'instructors') return doc.specialization === 'Yoga Instructor';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-health-text">Appointments</h1>
          <p className="text-health-muted">Book and manage your doctor appointments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`btn-secondary ${view === 'list' ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
          >
            My Appointments
          </button>
          <button
            onClick={() => setView('book')}
            className={`btn-secondary ${view === 'book' ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}`}
          >
            Book New
          </button>
        </div>
      </div>

      {view === 'list' ? (
        // Appointments List
        <div className="space-y-4">
          {appointments.length > 0 ? (
            <>
              {/* Upcoming */}
              {appointments.filter(a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED').length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-health-text mb-4">Upcoming Appointments</h2>
                  <div className="space-y-3">
                    {appointments
                      .filter(a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED')
                      .map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onCancel={() => handleCancelAppointment(appointment.id)}
                          onChat={() => setActiveChat({ id: appointment.doctor.id, name: appointment.doctor.name })}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Past/Cancelled */}
              {appointments.filter(a => a.status === 'CANCELLED' || a.status === 'COMPLETED').length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-health-text mb-4">Past Appointments</h2>
                  <div className="space-y-3">
                    {appointments
                      .filter(a => a.status === 'CANCELLED' || a.status === 'COMPLETED')
                      .map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card text-center py-12">
              <Calendar className="w-12 h-12 text-health-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-health-text mb-2">No appointments yet</h3>
              <p className="text-health-muted mb-4">Book your first appointment with a doctor</p>
              <button onClick={() => setView('book')} className="btn-primary">
                Book Appointment
              </button>
            </div>
          )}
        </div>
      ) : (
        // Book New Appointment
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: NL Input & Doctor Selection */}
          <div className="lg:col-span-1 space-y-4">
            {/* Natural Language Input */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-health-text">Smart Booking</h3>
              </div>
              <p className="text-sm text-health-muted mb-3">
                Describe your appointment in natural language
              </p>
              <textarea
                value={nlInput}
                onChange={(e) => setNlInput(e.target.value)}
                placeholder="e.g., Book an appointment with Dr. Sharma tomorrow morning"
                className="textarea text-sm w-full"
                rows={3}
              />
              <button
                onClick={handleNLExtraction}
                disabled={!nlInput.trim() || isExtracting}
                className="btn-accent w-full mt-3 flex items-center justify-center"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Extract Details
                  </>
                )}
              </button>

              {nlExtraction && (
                <div className="mt-3 p-3 rounded-lg bg-primary-50 border border-primary-200">
                  <p className="text-sm text-primary-800">
                    <strong>Extracted:</strong><br />
                    📅 Date: {nlExtraction.date}<br />
                    {nlExtraction.time && <>⏰ Time: {nlExtraction.time}<br /></>}
                    {nlExtraction.doctorName && <>👨‍⚕️ Doctor: {nlExtraction.doctorName}<br /></>}
                    📝 Intent: {nlExtraction.intent}
                  </p>
                </div>
              )}
            </div>

            {/* Doctor Selection */}
            <div className="card p-4">
              <h3 className="font-semibold text-health-text mb-3">Select Specialist</h3>

              {/* Category Tabs */}
              <div className="flex p-1 bg-health-muted/10 rounded-lg mb-3">
                <button
                  onClick={() => setCategory('all')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${category === 'all'
                    ? 'bg-health-card text-health-text shadow-sm'
                    : 'text-health-muted hover:text-health-text'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCategory('doctors')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${category === 'doctors'
                    ? 'bg-health-card text-health-text shadow-sm'
                    : 'text-health-muted hover:text-health-text'
                    }`}
                >
                  Doctors
                </button>
                <button
                  onClick={() => setCategory('instructors')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${category === 'instructors'
                    ? 'bg-health-card text-health-text shadow-sm'
                    : 'text-health-muted hover:text-health-text'
                    }`}
                >
                  Yoga
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedDoctor?.id === doctor.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-health-border hover:bg-health-muted/5'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${doctor.specialization === 'Yoga Instructor'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-blue-500/20 text-blue-500'
                        }`}>
                        {doctor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-health-text truncate">{doctor.name}</p>
                          {doctor.specialization === 'Yoga Instructor' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-500 font-medium">
                              Yoga
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-health-muted">{doctor.specialization}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-health-muted">{doctor.rating}</span>
                          <span className="text-xs text-health-muted">•</span>
                          <span className="text-xs text-health-muted">₹{doctor.consultationFee}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Calendar & Time Selection */}
          <div className="lg:col-span-2 space-y-4">
            {selectedDoctor ? (
              <>
                {/* Doctor Info */}
                <div className="card p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 text-xl font-semibold">
                      {selectedDoctor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-health-text">{selectedDoctor.name}</h3>
                      <p className="text-health-muted">{selectedDoctor.specialization}</p>
                      <p className="text-sm text-health-muted mt-1">{selectedDoctor.qualification}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{selectedDoctor.rating}</span>
                          <span className="text-sm text-health-muted">({selectedDoctor.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-health-muted">
                          <IndianRupee className="w-4 h-4" />
                          <span className="text-sm">{selectedDoctor.consultationFee}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="card p-4">
                  <h3 className="font-semibold text-health-text mb-4">Select Date</h3>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                      className="p-2 hover:bg-health-muted/10 rounded-lg text-health-text"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium text-health-text">
                      {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                    </span>
                    <button
                      onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                      className="p-2 hover:bg-health-muted/10 rounded-lg text-health-text"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                      const isSelected = isSameDay(day, selectedDate);
                      const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                      const isSunday = day.getDay() === 0;

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => !isPast && !isSunday && setSelectedDate(day)}
                          disabled={isPast || isSunday}
                          className={`p-3 rounded-lg text-center transition-colors ${isSelected
                            ? 'bg-primary-600 text-white'
                            : isPast || isSunday
                              ? 'bg-health-muted/5 text-health-muted/50 cursor-not-allowed'
                              : 'hover:bg-health-muted/10 text-health-text'
                            }`}
                        >
                          <div className="text-xs font-medium text-current">{format(day, 'EEE')}</div>
                          <div className="text-lg font-semibold text-current">{format(day, 'd')}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="card p-4">
                  <h3 className="font-semibold text-health-text mb-4">Select Time</h3>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-2 rounded-lg text-sm font-medium transition-colors ${selectedTime === slot.time
                            ? 'bg-primary-600 text-white'
                            : slot.available
                              ? 'border border-health-border text-health-text hover:bg-health-muted/10'
                              : 'bg-health-muted/5 text-health-muted/50 line-through cursor-not-allowed'
                            }`}
                        >
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-8 h-8 text-health-muted mx-auto mb-2" />
                      <p className="text-health-muted">No available slots on this day</p>
                    </div>
                  )}
                </div>

                {/* Reason & Book */}
                {selectedTime && (
                  <div className="card p-4">
                    <h3 className="font-semibold text-health-text mb-3">Appointment Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="label">Reason for visit (Optional)</label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="textarea w-full"
                          placeholder="Describe your symptoms or reason for visit..."
                          rows={3}
                        />
                      </div>

                      <div className="p-4 rounded-lg bg-health-muted/10 border border-health-border">
                        <h4 className="font-medium text-health-text mb-2">Booking Summary</h4>
                        <div className="space-y-1 text-sm text-health-text">
                          <p>👨‍⚕️ {selectedDoctor.name}</p>
                          <p>📅 {formatDate(selectedDate)}</p>
                          <p>⏰ {formatTime(selectedTime)}</p>
                          <p>💰 ₹{selectedDoctor.consultationFee}</p>
                        </div>
                      </div>

                      {bookingSuccess ? (
                        <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-green-50 text-green-700">
                          <Check className="w-5 h-5" />
                          <span className="font-medium">Appointment booked successfully!</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleBookAppointment}
                          disabled={isLoading}
                          className="btn-primary w-full py-3 flex items-center justify-center"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Booking...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Confirm Booking
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card p-6 text-center py-12">
                <User className="w-12 h-12 text-health-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-health-text mb-2">Select a Doctor</h3>
                <p className="text-health-muted">Choose a doctor from the list to view availability</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {activeChat && currentUserId && (
        <DoctorPatientChat
          recipientId={activeChat.id}
          recipientName={activeChat.name}
          recipientRole="doctor"
          currentUserId={currentUserId}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}

function AppointmentCard({
  appointment,
  onCancel,
  onChat
}: {
  appointment: any;
  onCancel?: () => void;
  onChat?: () => void;
}) {
  const statusColors: Record<string, string> = {
    PENDING: 'badge-warning',
    CONFIRMED: 'badge-success',
    CANCELLED: 'badge-danger',
    COMPLETED: 'badge-neutral',
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-health-muted/10 border border-health-border">
      <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 font-semibold">
        {appointment.doctor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-health-text">{appointment.doctor.name}</p>
        <p className="text-sm text-health-muted">{appointment.doctor.specialization}</p>
        <div className="flex items-center gap-2 mt-1 text-sm text-health-muted">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(appointment.scheduledDate)}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{formatTime(appointment.scheduledTime)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`badge ${statusColors[appointment.status]}`}>
          {appointment.status.toLowerCase()}
        </span>

        {/* Chat Button */}
        {onChat && appointment.status !== 'CANCELLED' && (
          <button
            onClick={onChat}
            className="p-2 text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
            title="Chat with Doctor"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        )}

        {onCancel && appointment.status !== 'CANCELLED' && (
          <button
            onClick={onCancel}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Cancel appointment"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
