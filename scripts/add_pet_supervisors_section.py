import re

PET_SECTION_HTML = '''
<!-- Pet-Friendly / On-Site Quality Control Supervisors Section -->
<section class="pet-supervisors-section" style="background:#071828;padding:60px 20px;color:#ffffff;text-align:center;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:inline-block;background:rgba(234,179,8,0.15);color:#eab308;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;padding:6px 16px;border-radius:20px;margin-bottom:12px;border:1px solid rgba(234,179,8,0.3);">
      100% Pet-Friendly Handyman
    </div>
    <h2 style="font-size:2.2rem;font-weight:800;color:#ffffff;margin-bottom:14px;letter-spacing:-0.5px;">
      Approved by Westchester's On-Site Quality Supervisors 🐾
    </h2>
    <p style="color:#94a3b8;font-size:1.05rem;max-width:720px;margin:0 auto 36px auto;line-height:1.6;">
      We love pets! Every home repair, TV mounting, and furniture assembly comes with complimentary belly rubs, zero stress, and rigorous quality inspection by your home's most important supervisors.
    </p>

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;text-align:left;">
      
      <!-- Card 1: Golden Retriever (New Photo) -->
      <div style="background:#0b2a4a;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;justify-content:space-between;">
        <div style="position:relative;height:280px;overflow:hidden;">
          <img src="/assets/images/dogs/david_furry_supervisor_golden.webp" alt="David with Golden Retriever site supervisor holding toy in Scarsdale NY" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy" decoding="async">
          <span style="position:absolute;top:12px;right:12px;background:#eab308;color:#071828;font-size:11px;font-weight:800;padding:4px 10px;border-radius:12px;text-transform:uppercase;">Scarsdale, NY</span>
        </div>
        <div style="padding:20px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <h3 style="color:#ffffff;font-size:1.2rem;font-weight:700;margin-bottom:8px;">Chief Toy &amp; Doorway Inspector</h3>
            <p style="color:#cbd5e1;font-size:0.95rem;line-height:1.5;margin-bottom:0;">
              "Strictly enforces the 2-toy minimum break policy and personally inspects every newly installed doorway for maximum tail-wag clearance!"
            </p>
          </div>
          <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);color:#eab308;font-size:0.85rem;font-weight:700;">
            ★★★★★ 5.0 Quality Rating • Approved
          </div>
        </div>
      </div>

      <!-- Card 2: Australian Shepherd -->
      <div style="background:#0b2a4a;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;justify-content:space-between;">
        <div style="position:relative;height:280px;overflow:hidden;">
          <img src="/assets/images/dogs/david_furry_supervisor_aussie.webp" alt="David with Australian Shepherd site supervisor in White Plains NY" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy" decoding="async">
          <span style="position:absolute;top:12px;right:12px;background:#eab308;color:#071828;font-size:11px;font-weight:800;padding:4px 10px;border-radius:12px;text-transform:uppercase;">White Plains, NY</span>
        </div>
        <div style="padding:20px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <h3 style="color:#ffffff;font-size:1.2rem;font-weight:700;margin-bottom:8px;">VP of Laser-Level Precision</h3>
            <p style="color:#cbd5e1;font-size:0.95rem;line-height:1.5;margin-bottom:0;">
              "Maintains strict oversight during floating shelf &amp; TV mount leveling. Gives a silent nod of approval once every wall anchor is locked in!"
            </p>
          </div>
          <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);color:#eab308;font-size:0.85rem;font-weight:700;">
            ★★★★★ 5.0 Quality Rating • Approved
          </div>
        </div>
      </div>

      <!-- Card 3: Labrador Retriever -->
      <div style="background:#0b2a4a;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;justify-content:space-between;">
        <div style="position:relative;height:280px;overflow:hidden;">
          <img src="/assets/images/dogs/david_furry_supervisor_lab.webp" alt="David with Labrador site supervisor in Harrison NY" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy" decoding="async">
          <span style="position:absolute;top:12px;right:12px;background:#eab308;color:#071828;font-size:11px;font-weight:800;padding:4px 10px;border-radius:12px;text-transform:uppercase;">Harrison, NY</span>
        </div>
        <div style="padding:20px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <h3 style="color:#ffffff;font-size:1.2rem;font-weight:700;margin-bottom:8px;">Director of Credenza &amp; Assembly Safety</h3>
            <p style="color:#cbd5e1;font-size:0.95rem;line-height:1.5;margin-bottom:0;">
              "Tests every flat-pack dresser drawer glide and dog crate credenza build for stability before handing over final clearance!"
            </p>
          </div>
          <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);color:#eab308;font-size:0.85rem;font-weight:700;">
            ★★★★★ 5.0 Quality Rating • Approved
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
'''

def update_index():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    target = '<section id="how-it-works"'
    if target in content:
        content = content.replace(target, PET_SECTION_HTML.strip() + '\n\n' + target)
        print("Successfully inserted pet-supervisors-section into index.html!")
    else:
        print("ERROR: Target not found in index.html")

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    update_index()
