---
layout: post
title:  "QEMU on Windows"
date:   2025-06-25 09:00:00 -0700
categories: tech
---

# QEMU on Windows

Enable hardware virtualization
- Reboot into your PC’s UEFI/BIOS settings.
- Enable “Intel VT-x,” “Intel Virtualization Technology,” or “AMD-V.”
- Save and reboot.

1. Enable hardware virtualization
   - Reboot into your PC’s UEFI/BIOS settings.
   - Enable “Intel VT-x,” “Intel Virtualization Technology,” or “AMD-V.”
   - Save and reboot.

2. Install QEMU
   Option A: Official Windows installer
   1. Go to [https://www.qemu.org/download/](https://www.qemu.org/download/)
   2. Under “Windows,” click "[64-bit](https://qemu.weilnetz.de/w64/)" for Stefan Weil's Windows builds.
   3. Run the installer and accept the defaults (or customize to your needs).
   4. By default, QEMU goes to `C:\Program Files\qemu`.

   Option B: MSYS2
   1. Open [https://www.msys2.org/](https://www.msys2.org/) in your browser.
   2. Follow the installation instructions provided on the website.
   3. In MSYS2, run:
      ```bash
      pacman -S mingw-w64-x86_64-qemu
      ```


3. Create a virtual disk image
   Open a Command Prompt or PowerShell and run, e.g.:
   ```powershell
   qemu-img create -f qcow2 C:\VMs\win11_disk.qcow2 64G
   ```
   This makes a 64 GiB QCOW2 disk at `C:\VMs\win11_disk.qcow2`.

4. Download your guest OS ISO
   - For example, grab a Windows 11 ISO from Microsoft or a Linux distro ISO.

5. Launch your VM
   In PowerShell or MSYS2, run something like:
   ```powershell
   qemu-system-x86_64 `
        -m 4G `
        -smp cores=2 `
        -cpu host,hypervisor=off `
        -M pc-q35-9.2 `
        -drive file=C:\VMs\win11_disk.qcow2,format=qcow2 `
        -cdrom C:\ISOs\Win11.iso `
        -boot d `
        -netdev user,id=net0 -device rtl8139,netdev=net0 `
        -enable-kvm `
        -device ich9-Intel-hda `
        -device hda-duplex `
        -device intel-hda `
        -device hda-codec-all `
        -device virtio-balloon-pci,bus=pcie.0,addr=0x4 `
        -device virtio-serial-pci,bus=pcie.0,addr=0x3 `
        -device qemu-xhci,bus=pcie.0,addr=0x2 `
        -device usb-tablet `
        -device usb-mouse `
        -device usb-kbd `
        -device ich9-ahci,id=sata0,bus=pcie.0,addr=0x7 `
        -display sdl,gl=on `
        -monitor stdio `
        -nodefaults
   ```

   ```bash
   qemu-system-x86_64 \
        -m 4G \
        -smp cores=2 \
        -cpu host,hypervisor=off \
        -M pc-q35-9.2 \
        -drive file=C:\VMs\win11_disk.qcow2,format=qcow2 \
        -cdrom C:\ISOs\Win11.iso \
        -boot d \
        -netdev user,id=net0 -device rtl8139,netdev=net0 \
        -enable-kvm \
        -device ich9-Intel-hda \
        -device hda-duplex \
        -device intel-hda \
        -device hda-codec-all \
        -device virtio-balloon-pci,bus=pcie.0,addr=0x4 \
        -device virtio-serial-pci,bus=pcie.0,addr=0x3 \
        -device qemu-xhci,bus=pcie.0,addr=0x2 \
        -device usb-tablet \
        -device usb-mouse \
        -device usb-kbd \
        -device ich9-ahci,id=sata0,bus=pcie.0,addr=0x7 \
        -display sdl,gl=on \
        -monitor stdio \
        -nodefaults
   ```
   Explanation of flags:
   - `-m 4G` gives 4 GiB RAM
   - `-smp cores=2` gives 2 CPU cores
   - `-drive …` attaches your virtual disk
   - `-cdrom … -boot d` boots from ISO for installation
   - `-netdev user,…` sets up user-mode networking
   - `-enable-kvm` attempts to use hardware acceleration (on Windows it may work as `-accel tcg` by default)

6. Install the OS and reboot
   - Complete the normal OS installer steps.
   - After install, remove `-cdrom … -boot d` (or change to `-boot c`) so it boots from the virtual disk.

7. (Optional) GUI front-end
   - You can install **virt-manager** under WSL2/MSYS2 with an X server, or use third-party GUIs like **AQEMU**.
   - This makes managing multiple VMs more convenient.

-- mino
