import React, {ReactNode, useCallback, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform} from 'react-native';
import Modal from 'react-native-modal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../theme';

interface SheetProps {
  visible: boolean;
  title: string;
  theme: any;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export const Sheet = ({visible, title, theme: T, onClose, children, footer}: SheetProps) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const handleModalShow = useCallback(() => {
    scrollRef.current?.scrollTo({x: 0, y: 0, animated: false});
  }, []);

  // Bug 8: previously this used react-native-modal's propagateSwipe + scrollTo/scrollOffset/
  // scrollOffsetMax props to let users swipe down anywhere in the sheet to close. That
  // gesture coupling fought the inner ScrollView on Android, causing vertical scroll to
  // jam past about half the modal height (most reproducibly in Edit Member, past the color
  // row). Tab-switch-then-back fixed it because the remount reset the gesture state.
  // Removing the coupling: users still close via the backdrop, the X button, or swiping
  // the handle bar at the top — no functional loss, predictable scroll throughout.
  return (
    <Modal
      isVisible={visible}
      onModalShow={handleModalShow}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{justifyContent: 'flex-end', margin: 0}}
      backdropOpacity={0.85}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={220}
      animationOutTiming={180}
      backdropTransitionInTiming={220}
      backdropTransitionOutTiming={180}
      useNativeDriver={false}
      useNativeDriverForBackdrop={false}
      avoidKeyboard={Platform.OS === 'ios'}
      hideModalContentWhileAnimating
    >
      <View style={[s.sheet, {backgroundColor: T.card, borderColor: T.border}]}>
        <View style={[s.handle, {backgroundColor: T.borderLt}]} />
        <View style={[s.header, {borderBottomColor: T.border}]}>
          <Text style={[s.title, {color: T.text}]}>{title}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={s.closeBtn}>
            <Text style={[s.closeX, {color: T.dim}]}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={scrollRef}
          style={s.body}
          contentContainerStyle={{paddingBottom: footer ? 24 : 24 + insets.bottom}}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          bounces={Platform.OS === 'ios'}
          overScrollMode="never"
        >
          {children}
        </ScrollView>
        {footer && <View style={[s.footer, {borderTopColor: T.border, paddingBottom: 16 + insets.bottom}]}>{footer}</View>}
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  sheet: {borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, height: '92%'},
  handle: {width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 6},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1},
  title: {fontFamily: Fonts.display, fontSize: 22, fontWeight: '600', fontStyle: 'italic'},
  closeBtn: {padding: 4},
  closeX: {fontSize: 16},
  body: {flex: 1, paddingHorizontal: 20, paddingTop: 16},
  footer: {flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1},
});
