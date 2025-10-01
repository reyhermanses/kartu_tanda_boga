import { InputField } from './InputField'
import { Footer } from './Footer'
// import { PhotoUploader } from './PhotoUploader'
import type { FormErrors, FormValues } from '../types'

type Props = {
  values: FormValues
  errors: FormErrors
  onChange: (next: Partial<FormValues>) => void
  onNext: () => void
  onProfileUpload?: () => void
  onPhotoError?: (message: string) => void
}

export function FormSection({ values, errors, onChange, onNext, onProfileUpload }: Props) {
  return (
    <div className="form-page iphone-se-form p-4 sm:p-6 relative overflow-hidden">
      {/* Background Image - Bottom Full Height */}
      <div 
        className="absolute bottom-0 left-0 right-0 top-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      <div className="relative z-10">
        {/* Profile Picture Section */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="relative inline-block">
            <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
              {values.photoFile ? (
                <img
                  src={URL.createObjectURL(values.photoFile)}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <svg className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <button
              onClick={onProfileUpload}
              className="text-white text-sm font-medium hover:text-red-300 transition-colors"
            >
              Ubah Profile
            </button>
            {errors.photoFile && (
              <p className="text-sm text-white mt-2">{errors.photoFile}</p>
            )}
          </div>
        </div>

        <section className="space-y-3 sm:space-y-4">
          <InputField
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            required
            value={values.name}
            onChange={(v) => onChange({ name: v })}
            error={errors.name}
          />
          <InputField
            label="Nomor Telepon"
            type="tel"
            placeholder="Masukkan nomor telepon"
            required
            value={values.phone}
            onChange={(v) => onChange({ phone: v })}
            error={errors.phone}
          />
          <label className="block">
            <span className="mb-2 block text-sm text-white font-medium">
              Tanggal Lahir <span className="text-red-300">*</span>
            </span>
            <div className="relative">
              <input
                type="date"
                value={values.birthday}
                onChange={(e) => onChange({ birthday: e.target.value })}
                className={`w-full rounded-[20px] border-2 bg-transparent px-3 py-3 sm:px-4 sm:py-5 text-white placeholder-white/70 outline-none focus:border-white focus:ring-1 focus:ring-white/50 focus:bg-transparent hover:bg-transparent transition-all text-base ${errors.birthday ? 'border-orange-500' : 'border-red-400'
                  }`}
                style={{
                  colorScheme: 'dark',
                  color: 'white',
                  paddingRight: '50px',
                  paddingBottom: '20px',
                  marginBottom: '8px'
                }}
                id="birthday-input"
              />
              {/* Custom Calendar Icon - Clickable */}
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('birthday-input') as HTMLInputElement;
                  if (input) {
                    input.showPicker();
                  }
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto cursor-pointer"
              >
                <svg className="w-5 h-5 text-white hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            {errors.birthday && (
              <span className="mt-1 block text-xs text-white">
                {errors.birthday}
              </span>
            )}
          </label>
          <InputField
            label="Email"
            type="email"
            placeholder="Masukkan email"
            required
            value={values.email}
            onChange={(v) => onChange({ email: v })}
            error={errors.email}
          />
          {/* Tanggal Lahir dan Jenis Kelamin dalam Row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Tanggal Lahir */}
            {/* <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tanggal Lahir <span className="text-red-300">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={values.birthday}
                  onChange={(e) => onChange({ birthday: e.target.value })}
                  className={`w-full rounded-[20px] border-2 bg-transparent px-3 py-3 sm:px-4 sm:py-5 text-white placeholder-white/70 outline-none focus:border-white focus:ring-1 focus:ring-white/50 focus:bg-transparent hover:bg-transparent transition-all ${errors.birthday ? 'border-orange-500' : 'border-red-400'
                    }`}
                  style={{
                    colorScheme: 'dark',
                    color: 'white',
                    paddingRight: '50px'
                  }}
                  id="birthday-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('birthday-input') as HTMLInputElement;
                    if (input) {
                      input.showPicker();
                    }
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto cursor-pointer"
                >
                  <svg className="w-5 h-5 text-white hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              {errors.birthday && (
                <p className="text-sm text-white mt-1">{errors.birthday}</p>
              )}
            </div> */}

            {/* Gender Selection - Dropdown */}
            {/* <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Jenis Kelamin <span className="text-red-300">*</span>
              </label>
              <select
                value={values.gender}
                onChange={(e) => onChange({ gender: e.target.value })}
                className={`w-full rounded-[20px] border-2 bg-transparent px-3 py-3 sm:px-4 sm:py-5 text-white outline-none focus:border-white focus:ring-1 focus:ring-white/50 focus:bg-transparent hover:bg-transparent transition-all ${
                  errors.gender ? 'border-orange-500' : 'border-red-400'
                }`}
                style={{ 
                  colorScheme: 'dark',
                  paddingBottom: '20px',
                  marginBottom: '8px',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px',
                  paddingRight: '40px',
                  cursor: 'pointer'
                }}
              >
                <option value="" className="text-gray-800">Pili Jenis Kelamin</option>
                <option value="M" className="text-gray-800">Laki-laki</option>
                <option value="F" className="text-gray-800">Perempuan</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-white">{errors.gender}</p>
              )}
            </div> */}
          </div>

          {/* Photo Upload - Commented for now */}
          {/* <PhotoUploader
        required
        error={errors.photoFile}
        onChange={(file) => onChange({ photoFile: file })}
        onError={onPhotoError}
      /> */}
          {/* <p className="mt-4 text-sm font-semibold text-white">Choose Card :</p> */}
        </section>

        {/* Next Button */}
        <div className="flex justify-center pt-4 sm:pt-6 md:pt-10 px-3 sm:px-6 pb-3 sm:pb-6">
          <button
            type="button"
            onClick={onNext}
            className="w-[150px] py-3 sm:py-4 rounded-[20px] font-bold text-sm sm:text-lg transition-all bg-white text-red-600 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}


